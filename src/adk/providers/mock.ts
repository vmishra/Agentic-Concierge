/**
 * Mock provider — a scripted, deterministic stand-in for Gemini.
 *
 * It walks the conversation through scenario *beats*: a beat decides what
 * tools to call, what text to stream, and what A2UI artifacts to emit. Tools
 * still execute against the real catalog, so the resulting artifacts contain
 * real filtered data. The reasoning is scripted; the plumbing is live.
 *
 * This is what lets the Mock demo feel alive — every refinement chip does
 * something concrete (re-filter hotels, re-rank tiers, etc.) rather than
 * replaying a pre-recorded video.
 */

import type { Provider, GenerateInput } from '../provider'
import type { ProviderChunk, ToolCall, TraceEvent } from '../types'
import type { A2UIArtifact } from '../a2ui'

export type BeatStep =
  | { kind: 'say'; text: string; gapMs?: number }
  | { kind: 'think'; text: string }
  | { kind: 'trace'; event: TraceEvent }
  | { kind: 'toolCall'; name: string; args: Record<string, unknown>; id?: string }
  | { kind: 'artifact'; artifact: A2UIArtifact | ((state: MockState) => A2UIArtifact) }
  | { kind: 'wait'; ms: number }

export interface MockState {
  /** Session-scoped bag — beats stash results between calls. */
  [k: string]: unknown
}

export interface Beat {
  id: string
  /** Is this beat a match for the current turn? */
  match: (input: GenerateInput, state: MockState) => boolean
  /** Steps to yield, in order. */
  steps: (input: GenerateInput, state: MockState) => BeatStep[] | AsyncIterable<BeatStep>
}

/**
 * A scenario script — an ordered list of beats per agent.
 * The provider picks the first beat whose `match` returns true for the agent.
 */
export interface ScenarioScript {
  name: string
  beats: Record<string, Beat[]>
  /** Optional fallback when no beat matches, per agent. */
  fallback?: Record<string, (input: GenerateInput, state: MockState) => BeatStep[]>
}

export interface MockProviderOptions {
  script: ScenarioScript
  /** Pause between characters of a `say` step to simulate streaming. */
  charDelayMs?: number
  /** Pause between steps to simulate thinking. */
  stepDelayMs?: number
  /** Optional external state the UI can consult. */
  state?: MockState
  label?: string
}

export class MockProvider implements Provider {
  name = 'mock'
  label: string
  private opts: Required<Omit<MockProviderOptions, 'label' | 'state'>> & { state: MockState }

  constructor(opts: MockProviderOptions) {
    this.label = opts.label ?? 'gemini-3-flash'
    this.opts = {
      script: opts.script,
      charDelayMs: opts.charDelayMs ?? 12,
      stepDelayMs: opts.stepDelayMs ?? 180,
      state: opts.state ?? {},
    }
  }

  model() {
    return 'gemini-3-flash'
  }

  async *generate(input: GenerateInput): AsyncGenerator<ProviderChunk> {
    const { script, charDelayMs, stepDelayMs, state } = this.opts
    const agentBeats = script.beats[input.agent] ?? []
    const beat = agentBeats.find((b) => b.match(input, state))
    const steps = beat
      ? beat.steps(input, state)
      : script.fallback?.[input.agent]?.(input, state) ?? defaultFallback(input)

    for await (const step of toAsync(steps)) {
      if (input.signal?.aborted) return
      switch (step.kind) {
        case 'say':
          for (const piece of chunkText(step.text)) {
            if (input.signal?.aborted) return
            yield { type: 'text', text: piece }
            await sleep(charDelayMs * piece.length)
          }
          // Paragraph break after every say — consecutive says become paragraphs.
          yield { type: 'text', text: '\n\n' }
          // Explicit gap, or a short natural pause.
          await sleep(step.gapMs ?? 260)
          break
        case 'think':
          yield { type: 'thinking', text: step.text }
          break
        case 'trace':
          yield { type: 'trace', event: step.event }
          break
        case 'toolCall': {
          const call: ToolCall = {
            id: step.id ?? crypto.randomUUID(),
            name: step.name,
            args: step.args,
          }
          yield { type: 'tool_call', call }
          break
        }
        case 'artifact': {
          const a = typeof step.artifact === 'function' ? step.artifact(state) : step.artifact
          yield { type: 'artifact', artifact: a }
          break
        }
        case 'wait':
          await sleep(step.ms)
          break
      }
      await sleep(stepDelayMs)
    }
    yield { type: 'done' }
  }
}

function defaultFallback(input: GenerateInput): BeatStep[] {
  // Stay in character. Each agent's voice is consistent even when the
  // conversation slides off-script.
  const a = input.agent
  if (a === 'Concierge') {
    return [
      {
        kind: 'say',
        text: 'Noted. Let me take a moment with that — would you like me to push on a particular dimension (closer to the venue, a quieter shape, a different tier), or should I keep what we have and bring a fresh option in alongside?',
      },
    ]
  }
  // Sub-agents respond with a short, neutral confirmation. Their output is
  // absorbed as a tool-result summary and does not surface to the user.
  return [{ kind: 'say', text: 'Acknowledged.' }]
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/** Stream text in realistic little chunks of 2–5 chars, not char-by-char. */
function* chunkText(text: string): Generator<string> {
  let i = 0
  while (i < text.length) {
    const len = 2 + Math.floor(Math.random() * 4)
    yield text.slice(i, i + len)
    i += len
  }
}

async function* toAsync<T>(src: T[] | AsyncIterable<T>): AsyncGenerator<T> {
  if (Array.isArray(src)) {
    for (const x of src) yield x
    return
  }
  for await (const x of src) yield x
}
