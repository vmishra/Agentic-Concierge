/**
 * LlmAgent — a single named agent with a system prompt, a toolbelt, a set of
 * loadable skills, and optional sub-agents exposed as tools.
 *
 * This is a faithful-enough shape of ADK's LlmAgent — minus the server parts.
 */

import type { AgentCallbacks } from './callbacks'
import type { ToolCatalog, LazyTool } from './tool'
import type { SkillRegistry } from './skill'
import type { Provider } from './provider'
import type { AgentCard } from './types'

export interface LlmAgentInit {
  name: string
  description: string
  shortName?: string
  systemPrompt: string
  /** Tools always available to this agent. */
  tools?: LazyTool[]
  /** Skills this agent may *load on demand*. */
  skills?: string[]
  /** Sub-agents exposed as AgentTools. */
  subAgents?: LlmAgent[]
  /** Which provider to use. Defaults to the root provider. */
  provider?: Provider
  /** Model hint. */
  model?: string
  callbacks?: AgentCallbacks
  /** Thinking level hint. */
  thinking?: 'minimal' | 'low' | 'medium' | 'high'
}

export class LlmAgent {
  readonly name: string
  readonly description: string
  readonly shortName: string
  readonly systemPrompt: string
  readonly tools: LazyTool[]
  readonly skills: string[]
  readonly subAgents: LlmAgent[]
  readonly callbacks?: AgentCallbacks
  readonly thinking?: 'minimal' | 'low' | 'medium' | 'high'
  readonly model?: string
  readonly provider?: Provider

  constructor(init: LlmAgentInit) {
    this.name = init.name
    this.description = init.description
    this.shortName = init.shortName ?? init.name
    this.systemPrompt = init.systemPrompt
    this.tools = init.tools ?? []
    this.skills = init.skills ?? []
    this.subAgents = init.subAgents ?? []
    this.callbacks = init.callbacks
    this.thinking = init.thinking
    this.model = init.model
    this.provider = init.provider
  }

  card(): AgentCard {
    return {
      name: this.name,
      description: this.description,
      shortName: this.shortName,
      skills: this.skills,
      model: this.model,
    }
  }

  /** Register this agent's own tools + sub-agent-as-tools into a catalog. */
  primeCatalog(catalog: ToolCatalog): void {
    for (const t of this.tools) if (!catalog.has(t.manifest.name)) catalog.register(t)
    for (const sub of this.subAgents) {
      const asTool = agentAsTool(sub)
      if (!catalog.has(asTool.manifest.name)) catalog.register(asTool)
    }
  }

  /** Ensure skill registrations — skills are attached lazily by the runner. */
  ensureSkills(_registry: SkillRegistry, _catalog: ToolCatalog): void {
    // Skill loading is runner-driven, per turn. Nothing to do eagerly.
  }
}

/**
 * AgentTool — wraps a sub-agent so the coordinator can call it like any tool.
 *
 * The sub-agent runs with a *fresh* session seeded by the coordinator's query,
 * streams its artifacts to the same runner (so the user still sees one cohesive
 * workspace), and returns a short summary to the coordinator.
 */
export function agentAsTool(agent: LlmAgent): LazyTool {
  return {
    manifest: {
      name: `agent.${agent.name}`,
      description: `Delegate to the ${agent.name} agent — ${agent.description}`,
      input: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'The sub-task for this specialist.' },
          notes: { type: 'string', description: 'Any additional constraints.' },
        },
        required: ['task'],
      },
      owner: 'runner',
      cost: 'medium',
    },
    load: async () => {
      // Implementation is injected by the runner when it detects an agent.* call.
      // This shim is intentionally empty — the runner intercepts and handles
      // agent-as-tool calls directly, so it can stream the sub-agent's trace
      // events into the same transcript.
      return {
        manifest: {
          name: `agent.${agent.name}`,
          description: '',
          input: { type: 'object', properties: {} },
        },
        async execute() {
          throw new Error(
            `agent.${agent.name} is handled by the runner; direct execution is not supported`,
          )
        },
      }
    },
  }
}
