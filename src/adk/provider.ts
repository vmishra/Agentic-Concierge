/**
 * Provider — the swappable LLM backend.
 *
 * Mock and Gemini-live providers both implement this interface. The runner
 * knows nothing about either; it just consumes ProviderChunks.
 */

import type { ToolManifest } from './tool'
import type { Message, ProviderChunk } from './types'

export interface GenerateInput {
  system: string
  messages: Message[]
  /** Tool manifests the agent may call this turn. */
  tools: ToolManifest[]
  /** Agent name, used by Mock to look up scripted beats. */
  agent: string
  /** Hint for progressive disclosure / thinking level. */
  thinking?: 'minimal' | 'low' | 'medium' | 'high'
  signal?: AbortSignal
}

export interface Provider {
  name: string
  label: string
  /** A stream of chunks. The runner multiplexes them. */
  generate(input: GenerateInput): AsyncIterable<ProviderChunk>
  /** Optional — returns the active model id for display. */
  model?(): string
  /** Optional — count tokens accurately (Live uses Gemini count-tokens). */
  countTokens?(messages: Message[]): Promise<number>
}
