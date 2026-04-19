/**
 * Callbacks — the inspection hooks ADK exposes around model calls.
 *
 * Agents can wire `beforeModel` (mutate/augment the request) and `afterModel`
 * (inspect/rewrite the response) callbacks. Used here for memory injection,
 * guardrails, and tracing.
 */

import type { GenerateInput } from './provider'
import type { Message, TraceEntry } from './types'

export interface CallbackContext {
  agent: string
  onTrace?: (t: TraceEntry) => void
}

export interface AgentCallbacks {
  /** Called just before a provider generate. May mutate `input` in place. */
  beforeModel?: (input: GenerateInput, ctx: CallbackContext) => void | Promise<void>
  /** Called once a turn's streaming message is fully assembled. */
  afterModel?: (message: Message, ctx: CallbackContext) => void | Promise<void>
  /** Called on a successful tool result. */
  afterTool?: (toolName: string, result: unknown, ctx: CallbackContext) => void | Promise<void>
}
