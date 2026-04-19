/**
 * ContextBudget — long-context discipline, visibly.
 *
 * Even with a 1M-token window, a well-mannered agent keeps its working set
 * trim. This measures approximate token usage, flags when we cross a soft
 * threshold, and rolls older turns into a compact `priorSummary` so the
 * live context stays lean.
 *
 * The measurement is approximate on purpose — it's meant to be *seen* by
 * demo viewers (the Context meter in the topbar), not to drive billing.
 */

import type { Message, Session, TraceEntry } from './types'

export interface BudgetReport {
  used: number
  budget: number
  pct: number
  breakdown: { messages: number; summary: number; artifacts: number }
}

/** Approximate tokens from text — GPT/Gemini average ≈ 4 chars per token. */
export function approxTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function measureSession(s: Session, budget: number): BudgetReport {
  let messages = 0
  let artifacts = 0
  for (const m of s.messages) {
    messages += approxTokens(m.content)
    for (const a of m.artifacts ?? []) artifacts += approxTokens(JSON.stringify(a))
  }
  const summary = approxTokens(s.priorSummary ?? '')
  const used = messages + summary + artifacts
  return {
    used,
    budget,
    pct: Math.min(1, used / budget),
    breakdown: { messages, summary, artifacts },
  }
}

/**
 * Compact — if past the threshold, fold the oldest N messages into the
 * `priorSummary` note and drop them from the live window. Returns how many
 * tokens were saved.
 */
export function compactIfNeeded(
  s: Session,
  budget: number,
  softFraction = 0.3,
  keepLastN = 6,
  onTrace?: (t: TraceEntry) => void,
): number {
  const before = measureSession(s, budget)
  if (before.pct < softFraction) return 0
  if (s.messages.length <= keepLastN) return 0

  const cut = s.messages.slice(0, s.messages.length - keepLastN)
  const kept = s.messages.slice(-keepLastN)
  const summary = summarize(cut)
  const combined = s.priorSummary
    ? `${s.priorSummary}\n\n${summary}`
    : summary

  const saved = before.breakdown.messages - kept.reduce((n, m) => n + approxTokens(m.content), 0)
  s.messages = kept
  s.priorSummary = combined

  onTrace?.({
    id: crypto.randomUUID(),
    at: Date.now(),
    source: 'runner',
    event: { kind: 'context.compact', savedTokens: saved },
  })
  return saved
}

/** Very small summariser — turn a run of messages into a few crisp lines. */
function summarize(msgs: Message[]): string {
  const lines: string[] = []
  for (const m of msgs) {
    const clipped = m.content.length > 180 ? `${m.content.slice(0, 180)}…` : m.content
    const who = m.agent ? `${m.role}/${m.agent}` : m.role
    lines.push(`· ${who}: ${clipped.replace(/\s+/g, ' ').trim()}`)
  }
  return `prior context (compacted):\n${lines.join('\n')}`
}
