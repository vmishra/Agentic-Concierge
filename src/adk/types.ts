/**
 * Core types for the ADK-shaped emulation layer.
 *
 * These mirror Google ADK primitives (Agents, Tools, Skills, Sessions, Memory,
 * Runners, Callbacks) so the prototype can teach the concepts clearly, but they
 * are intentionally small — this is a reference implementation that runs
 * entirely in the browser with no server.
 */

import type { A2UIArtifact } from './a2ui'

export type Role = 'user' | 'assistant' | 'system' | 'tool'

export interface Message {
  id: string
  role: Role
  content: string
  toolCallId?: string
  toolName?: string
  createdAt: number
  /** Artifacts the assistant emitted for this turn, in order. */
  artifacts?: A2UIArtifact[]
  /** Pending tool calls the assistant requested. */
  toolCalls?: ToolCall[]
  /** Truthy while the turn is still streaming. */
  streaming?: boolean
  /** Which agent produced this message (for multi-agent transparency). */
  agent?: string
}

export interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

export interface ToolResult {
  id: string
  name: string
  ok: boolean
  result?: unknown
  error?: string
}

/**
 * A stream chunk emitted by a Provider. The runner multiplexes these into
 * text deltas, tool calls, artifacts, trace events, etc.
 */
export type ProviderChunk =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'artifact'; artifact: A2UIArtifact }
  | { type: 'trace'; event: TraceEvent }
  | { type: 'done'; stopReason?: string }

/**
 * Trace events surface agent internals to the UI's Activity Ribbon.
 * They are the "show your work" contract of the demo.
 */
export type TraceEvent =
  | { kind: 'skill.load'; skill: string; tools: string[]; reason?: string }
  | { kind: 'tool.load'; tool: string; via?: string }
  | { kind: 'tool.call'; tool: string; args: Record<string, unknown>; callId: string }
  | { kind: 'tool.result'; tool: string; ok: boolean; summary?: string; callId: string }
  | { kind: 'tool.error'; tool: string; message: string; callId: string }
  | { kind: 'agent.dispatch'; from: string; to: string; reason?: string }
  | { kind: 'agent.return'; agent: string; summary?: string }
  | { kind: 'memory.read'; query: string; hits: number }
  | { kind: 'memory.write'; fact: string }
  | { kind: 'artifact.emit'; ref: string; artifactKind: string }
  | { kind: 'context.compact'; savedTokens: number }
  | { kind: 'research.step'; step: number; question: string; status: 'plan' | 'search' | 'critique' | 'refine' }
  | { kind: 'thinking'; text: string }

/** A timestamped trace event, as stored by the store. */
export interface TraceEntry {
  id: string
  at: number
  /** Which agent (or 'runner') produced this event. */
  source: string
  event: TraceEvent
}

/** Session state — short-term working memory for an agent invocation. */
export interface Session {
  id: string
  messages: Message[]
  /** Arbitrary scratchpad, visible across agents within a session. */
  state: Record<string, unknown>
  /** Rolling compact summary of older turns, used for long-context discipline. */
  priorSummary?: string
}

export interface AgentCard {
  name: string
  description: string
  /** Short label shown in trace chips. */
  shortName?: string
  /** Skills the agent may load on-demand. */
  skills: string[]
  /** Model hint the provider may use. */
  model?: string
}

export interface RunOptions {
  session: Session
  onTrace?: (entry: TraceEntry) => void
  onArtifact?: (artifact: A2UIArtifact) => void
  onDelta?: (text: string) => void
  onDone?: (message: Message) => void
  signal?: AbortSignal
  /** Cap on nested sub-agent calls to prevent runaway loops. */
  maxDepth?: number
}
