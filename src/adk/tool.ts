/**
 * Tools — typed, lazy-loaded, provider-agnostic.
 *
 * A tool is a manifest (name, description, schema) + an implementation.
 * Manifests are cheap; implementations are `() => Promise<Tool>` and are only
 * resolved when a skill is loaded or the tool is about to be called. This
 * makes "tool loading architecture" a visible first-class concept in the
 * Activity Ribbon — viewers see `tool.load(...)` chips as the conversation
 * expands the agent's toolbelt on demand.
 */

import type { ToolCall, ToolResult } from './types'

export type JsonSchema = {
  type: 'object'
  properties: Record<string, { type: string; description?: string; enum?: readonly unknown[] }>
  required?: string[]
  additionalProperties?: boolean
}

export interface ToolManifest {
  name: string
  description: string
  /** Minimal JSON-Schema for args. */
  input: JsonSchema
  /** Informational only. */
  output?: string
  /** Skill that owns this tool (used for lazy-load tracing). */
  owner?: string
  /** Rough cost hint — lets the coordinator prefer cheaper tools when multiple qualify. */
  cost?: 'low' | 'medium' | 'high'
}

export interface Tool<TArgs = Record<string, unknown>, TResult = unknown> {
  manifest: ToolManifest
  /** Implementation — receives validated args, returns result. */
  execute(args: TArgs, ctx: ToolContext): Promise<TResult>
}

export interface ToolContext {
  /** Abort the tool if the user cancels or the runner aborts. */
  signal?: AbortSignal
  /** Arbitrary session-scoped scratchpad. */
  state: Record<string, unknown>
  /** For tracing sub-events from inside a tool. */
  trace?: (msg: string) => void
}

/** A lazy tool descriptor — only resolves the implementation when called. */
export interface LazyTool {
  manifest: ToolManifest
  load: () => Promise<Tool>
}

export function defineTool<TArgs extends Record<string, unknown>, TResult>(
  manifest: ToolManifest,
  execute: (args: TArgs, ctx: ToolContext) => Promise<TResult>,
): Tool<TArgs, TResult> {
  return { manifest, execute }
}

export function defineLazyTool(manifest: ToolManifest, load: () => Promise<Tool>): LazyTool {
  return { manifest, load }
}

/**
 * ToolCatalog — registry of every tool that *could* be called. Tools live
 * here as manifests; implementations are only loaded via `load()`.
 */
export class ToolCatalog {
  private tools = new Map<string, LazyTool>()

  register(tool: LazyTool): void {
    this.tools.set(tool.manifest.name, tool)
  }

  registerAll(tools: LazyTool[]): void {
    for (const t of tools) this.register(t)
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }

  manifest(name: string): ToolManifest | undefined {
    return this.tools.get(name)?.manifest
  }

  manifests(): ToolManifest[] {
    return [...this.tools.values()].map((t) => t.manifest)
  }

  async load(name: string): Promise<Tool> {
    const lazy = this.tools.get(name)
    if (!lazy) throw new Error(`tool not registered: ${name}`)
    return lazy.load()
  }

  async call(call: ToolCall, ctx: ToolContext): Promise<ToolResult> {
    const tool = await this.load(call.name).catch((e) => {
      throw new Error(`failed to load tool ${call.name}: ${String(e)}`)
    })
    try {
      const result = await tool.execute(call.args, ctx)
      return { id: call.id, name: call.name, ok: true, result }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return { id: call.id, name: call.name, ok: false, error: msg }
    }
  }
}
