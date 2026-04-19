/**
 * Runner — executes an agent turn.
 *
 * Responsibilities:
 *  1. Assemble the prompt: system + prior messages + memory injection +
 *     active-skill instructions + tool manifests.
 *  2. Stream from the provider, multiplexing text, tool calls, artifacts, and
 *     trace events out to the UI through callbacks.
 *  3. When the provider asks for a tool, either:
 *       - load + execute it (FunctionTool) and feed the result back, OR
 *       - dispatch to a sub-agent (AgentTool), which re-enters run() with its
 *         own system prompt — the sub-agent's artifacts and traces bubble up
 *         to the same workspace so the user sees one coherent story.
 *  4. Run before/after callbacks (memory injection, guardrails, trace).
 *  5. Keep the context budget under control via `compactIfNeeded`.
 *
 * The runner is provider-agnostic — Mock and Gemini both plug in via Provider.
 */

import { compactIfNeeded } from './context-budget'
import type { LlmAgent } from './agent'
import type { Provider } from './provider'
import type { SkillRegistry, Skill } from './skill'
import type { ToolCatalog } from './tool'
import type { MemoryService } from './memory'
import type {
  Message,
  ProviderChunk,
  RunOptions,
  Session,
  ToolCall,
  ToolResult,
  TraceEntry,
} from './types'

const DEFAULT_BUDGET = 1_000_000

export interface RuntimeConfig {
  provider: Provider
  catalog: ToolCatalog
  skills: SkillRegistry
  memory?: MemoryService
  /** Token budget for long-context compaction. */
  budget?: number
}

export async function run(
  agent: LlmAgent,
  userInput: string,
  rt: RuntimeConfig,
  opts: RunOptions,
): Promise<Message> {
  const { provider, catalog, skills, memory } = rt
  const budget = rt.budget ?? DEFAULT_BUDGET
  const session = opts.session
  const depth = opts.maxDepth ?? 0

  // 1. Append the user message (only at depth 0; sub-agents get their task via
  //    the tool-call args, not a fresh user turn).
  if (depth === 0 && userInput) {
    session.messages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      createdAt: Date.now(),
    })
  }

  // 2. Register this agent's tools + sub-agents into the catalog.
  agent.primeCatalog(catalog)

  // 3. Memory injection — if there's a MemoryService, pull relevant facts.
  const activeSkills: Skill[] = []
  const injectedInstructions: string[] = [agent.systemPrompt]

  if (memory && depth === 0 && userInput) {
    const hits = await memory.search(userInput, 4, 0.22)
    if (hits.length > 0) {
      opts.onTrace?.(trace(agent.name, { kind: 'memory.read', query: userInput, hits: hits.length }))
      const facts = hits.map((h) => `- ${h.fact.text}`).join('\n')
      injectedInstructions.push(
        `Known preferences and past facts about this traveller (recall from long-term memory; weave them in without naming the source):\n${facts}`,
      )
    }
  }

  // 4. Load skills declared by the agent. Each skill load is a visible trace
  //    event so viewers see the toolbelt expanding on demand.
  for (const name of agent.skills) {
    const skill = skills.load(name, catalog)
    activeSkills.push(skill)
    opts.onTrace?.(
      trace(agent.name, {
        kind: 'skill.load',
        skill: skill.name,
        tools: skill.tools.map((t) => t.manifest.name),
      }),
    )
    injectedInstructions.push(`## Skill: ${skill.name}\n${skill.instructions}`)
    for (const res of skill.resources ?? []) {
      injectedInstructions.push(`### ${res.label}\n${res.body}`)
    }
  }

  // 5. Compact older turns into a priorSummary if we're over the soft limit.
  compactIfNeeded(session, budget, 0.3, 6, opts.onTrace)

  // 6. Build the toolbelt — agent's own + active-skill tools + sub-agent tools.
  const toolManifests = dedupe(
    [
      ...agent.tools.map((t) => t.manifest),
      ...activeSkills.flatMap((s) => s.tools.map((t) => t.manifest)),
      ...agent.subAgents.map((sa) => ({
        name: `agent.${sa.name}`,
        description: `Delegate to ${sa.shortName} — ${sa.description}`,
        input: {
          type: 'object' as const,
          properties: {
            task: { type: 'string', description: 'The sub-task.' },
            notes: { type: 'string', description: 'Additional constraints.' },
          },
          required: ['task'],
        },
      })),
    ],
    (m) => m.name,
  )

  // 7. Prepare an assistant message to stream into.
  const assistantMsg: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    createdAt: Date.now(),
    streaming: true,
    agent: agent.name,
    artifacts: [],
    toolCalls: [],
  }
  session.messages.push(assistantMsg)

  // 8. Run the provider loop, handling tool calls as they arrive, until done.
  //    A tool call causes a sub-turn: we execute the tool, append the
  //    tool-result message, and re-invoke the provider.
  let keepGoing = true
  let safety = 0
  while (keepGoing && safety++ < 6) {
    keepGoing = false

    const stream = provider.generate({
      system: injectedInstructions.join('\n\n'),
      messages: session.messages.filter((m) => m.id !== assistantMsg.id || m.content),
      tools: toolManifests,
      agent: agent.name,
      thinking: agent.thinking,
      signal: opts.signal,
    })

    const pendingCalls: ToolCall[] = []

    for await (const chunk of stream) {
      if (opts.signal?.aborted) break
      applyChunk(chunk, assistantMsg, opts, agent.name, pendingCalls)
    }

    // 9. If the provider produced tool calls, execute and feed results back.
    if (pendingCalls.length > 0) {
      const results = await Promise.all(
        pendingCalls.map(async (call) => {
          if (call.name.startsWith('agent.')) {
            return dispatchSubAgent(call, agent, rt, opts, depth)
          }
          opts.onTrace?.(
            trace(agent.name, {
              kind: 'tool.call',
              tool: call.name,
              args: call.args,
              callId: call.id,
            }),
          )
          const r = await catalog.call(call, {
            signal: opts.signal,
            state: session.state,
            trace: (msg) => opts.onTrace?.(trace(agent.name, { kind: 'thinking', text: msg })),
          })
          if (r.ok) {
            opts.onTrace?.(
              trace(agent.name, {
                kind: 'tool.result',
                tool: call.name,
                ok: true,
                summary: summarise(r.result),
                callId: call.id,
              }),
            )
            agent.callbacks?.afterTool?.(call.name, r.result, { agent: agent.name, onTrace: opts.onTrace })
          } else {
            opts.onTrace?.(
              trace(agent.name, {
                kind: 'tool.error',
                tool: call.name,
                message: r.error ?? 'unknown',
                callId: call.id,
              }),
            )
          }
          return r
        }),
      )

      for (const r of results) {
        session.messages.push({
          id: crypto.randomUUID(),
          role: 'tool',
          content: safeStringify(r.ok ? r.result : { error: r.error }),
          toolCallId: r.id,
          toolName: r.name,
          createdAt: Date.now(),
        })
      }

      // Let the provider continue reasoning over the new tool output.
      keepGoing = true
      assistantMsg.toolCalls = []
    }
  }

  assistantMsg.streaming = false
  await agent.callbacks?.afterModel?.(assistantMsg, { agent: agent.name, onTrace: opts.onTrace })
  opts.onDone?.(assistantMsg)
  return assistantMsg
}

function applyChunk(
  chunk: ProviderChunk,
  msg: Message,
  opts: RunOptions,
  agentName: string,
  pendingCalls: ToolCall[],
): void {
  switch (chunk.type) {
    case 'text': {
      msg.content += chunk.text
      opts.onDelta?.(chunk.text)
      return
    }
    case 'thinking': {
      opts.onTrace?.(trace(agentName, { kind: 'thinking', text: chunk.text }))
      return
    }
    case 'tool_call': {
      msg.toolCalls?.push(chunk.call)
      pendingCalls.push(chunk.call)
      return
    }
    case 'artifact': {
      msg.artifacts?.push(chunk.artifact)
      opts.onArtifact?.(chunk.artifact)
      opts.onTrace?.(
        trace(agentName, {
          kind: 'artifact.emit',
          ref: chunk.artifact.id,
          artifactKind: chunk.artifact.kind,
        }),
      )
      return
    }
    case 'trace': {
      opts.onTrace?.({
        id: crypto.randomUUID(),
        at: Date.now(),
        source: agentName,
        event: chunk.event,
      })
      return
    }
    case 'done':
      return
  }
}

async function dispatchSubAgent(
  call: ToolCall,
  parent: LlmAgent,
  rt: RuntimeConfig,
  opts: RunOptions,
  depth: number,
): Promise<ToolResult> {
  const subName = call.name.slice('agent.'.length)
  const sub = parent.subAgents.find((a) => a.name === subName)
  if (!sub) {
    return { id: call.id, name: call.name, ok: false, error: `unknown sub-agent ${subName}` }
  }
  opts.onTrace?.(
    trace(parent.name, {
      kind: 'agent.dispatch',
      from: parent.name,
      to: sub.name,
      reason: String(call.args.task ?? ''),
    }),
  )
  const subSession: Session = {
    id: crypto.randomUUID(),
    messages: [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: String(call.args.task ?? '') + (call.args.notes ? `\n\nNotes: ${String(call.args.notes)}` : ''),
        createdAt: Date.now(),
      },
    ],
    state: { ...opts.session.state },
  }
  const subMessage = await run(sub, '', rt, {
    session: subSession,
    onTrace: opts.onTrace,
    onArtifact: opts.onArtifact,
    onDelta: undefined,
    onDone: undefined,
    signal: opts.signal,
    maxDepth: depth + 1,
  })
  // Propagate any artifacts emitted by the sub-agent up to the parent message,
  // so the workspace shows them regardless of which agent produced them.
  opts.onTrace?.(
    trace(parent.name, {
      kind: 'agent.return',
      agent: sub.name,
      summary: summarise(subMessage.content),
    }),
  )
  return {
    id: call.id,
    name: call.name,
    ok: true,
    result: {
      summary: subMessage.content,
      artifactIds: (subMessage.artifacts ?? []).map((a) => a.id),
    },
  }
}

function trace(source: string, event: TraceEntry['event']): TraceEntry {
  return { id: crypto.randomUUID(), at: Date.now(), source, event }
}

function dedupe<T>(xs: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const x of xs) {
    const k = key(x)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

function summarise(v: unknown): string {
  const s = typeof v === 'string' ? v : safeStringify(v)
  return s.length > 120 ? `${s.slice(0, 120)}…` : s
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}
