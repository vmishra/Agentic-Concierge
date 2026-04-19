/**
 * Workflow agents — deterministic controllers that compose LlmAgents.
 *
 * Sequential: run A, then B, then C — each sees the prior's output.
 * Parallel:   run [A, B, C] with the same input, merge artifacts.
 * Loop:       run A repeatedly until a predicate says stop (or max iters).
 *
 * These mirror ADK's SequentialAgent / ParallelAgent / LoopAgent primitives.
 * They're used inside the Researcher to implement the deep-research loop.
 */

import type { LlmAgent } from './agent'

export type WorkflowKind = 'sequential' | 'parallel' | 'loop'

export interface WorkflowSpec {
  kind: WorkflowKind
  name: string
  children: LlmAgent[]
  /** For loop: max iterations. */
  max?: number
  /** For loop: stop when predicate returns true. */
  stopWhen?: (iteration: number, lastOutput: string) => boolean
}

export function Sequential(name: string, children: LlmAgent[]): WorkflowSpec {
  return { kind: 'sequential', name, children }
}

export function Parallel(name: string, children: LlmAgent[]): WorkflowSpec {
  return { kind: 'parallel', name, children }
}

export function Loop(
  name: string,
  child: LlmAgent,
  opts?: { max?: number; stopWhen?: (i: number, out: string) => boolean },
): WorkflowSpec {
  return {
    kind: 'loop',
    name,
    children: [child],
    max: opts?.max ?? 3,
    stopWhen: opts?.stopWhen,
  }
}
