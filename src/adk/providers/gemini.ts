/**
 * Gemini provider — calls Gemini 3 Flash directly from the browser using
 * the `@google/genai` SDK with a user-supplied API key. Browser-exposed keys
 * are a prototype-only pattern; the Settings sheet warns about it.
 *
 * This provider is lean on purpose — it hands the agent definition through
 * unchanged and returns a stream the runner can multiplex.
 */

import { GoogleGenAI } from '@google/genai'
import type { GenerateInput, Provider } from '../provider'
import type { ProviderChunk, ToolCall } from '../types'

const THINKING_BUDGET: Record<NonNullable<GenerateInput['thinking']>, number> = {
  minimal: 0,
  low: 1024,
  medium: 4096,
  high: 16_384,
}

export interface GeminiProviderOptions {
  apiKey: string
  model?: string
  /** Embedding model used by the MemoryService in Live mode. */
  embedding?: string
}

export class GeminiProvider implements Provider {
  name = 'gemini'
  label = 'gemini-3-flash'
  private ai: GoogleGenAI
  private modelId: string
  readonly embeddingModel: string

  constructor(opts: GeminiProviderOptions) {
    this.ai = new GoogleGenAI({ apiKey: opts.apiKey })
    this.modelId = opts.model ?? 'gemini-3-flash'
    this.embeddingModel = opts.embedding ?? 'gemini-embedding-2'
  }

  /** Gemini embeddings — used by MemoryService in Live mode for semantic recall. */
  async embed(texts: string[]): Promise<number[][]> {
    const res = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: texts.map((t) => ({ role: 'user', parts: [{ text: t }] })),
    } as Parameters<typeof this.ai.models.embedContent>[0])
    const embeddings = (res as { embeddings?: { values: number[] }[] }).embeddings
    return (embeddings ?? []).map((e) => e.values)
  }

  model() {
    return this.modelId
  }

  async countTokens(messages: GenerateInput['messages']): Promise<number> {
    try {
      const res = await this.ai.models.countTokens({
        model: this.modelId,
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      })
      return res.totalTokens ?? 0
    } catch {
      return 0
    }
  }

  async *generate(input: GenerateInput): AsyncGenerator<ProviderChunk> {
    const tools = input.tools.length
      ? [
          {
            functionDeclarations: input.tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.input as unknown as Record<string, unknown>,
            })),
          },
        ]
      : undefined

    const thinkingBudget = input.thinking ? THINKING_BUDGET[input.thinking] : undefined

    const stream = await this.ai.models.generateContentStream({
      model: this.modelId,
      contents: input.messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role === 'tool' ? 'function' : 'user',
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: input.system,
        tools,
        ...(thinkingBudget !== undefined ? { thinkingConfig: { thinkingBudget } } : {}),
      },
    })

    for await (const chunk of stream) {
      if (input.signal?.aborted) return
      const text = chunk.text
      if (text) yield { type: 'text', text }
      const candidates = chunk.candidates ?? []
      for (const cand of candidates) {
        const parts = cand.content?.parts ?? []
        for (const part of parts) {
          const fn = (part as { functionCall?: { name: string; args?: Record<string, unknown> } }).functionCall
          if (fn?.name) {
            const call: ToolCall = {
              id: crypto.randomUUID(),
              name: fn.name,
              args: fn.args ?? {},
            }
            yield { type: 'tool_call', call }
          }
        }
      }
    }
    yield { type: 'done' }
  }
}
