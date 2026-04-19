/**
 * Human-in-the-Loop — ADK's ask_user / request_approval pattern.
 *
 * When an agent needs a human decision mid-turn, it calls a tool that awaits
 * a promise. The UI renders the pending request as an A2UI artifact with
 * interactive controls; when the user responds, the promise resolves and
 * the tool returns a structured result. The runner's tool loop naturally
 * pauses and resumes — HITL is a proper tool call, not a side channel.
 */

export type HitlDecision =
  | { kind: 'approval'; approved: boolean; note?: string }
  | { kind: 'choice'; choiceId: string; label: string }
  | { kind: 'text'; text: string }

export interface HitlPending {
  id: string
  resolve: (d: HitlDecision) => void
}

type Listener = (resolved: { id: string; decision: HitlDecision }) => void

/**
 * HitlBus — a tiny pub/sub keyed by request id. Tools await a request;
 * the UI resolves it when the user clicks.
 */
export class HitlBus {
  private pending = new Map<string, HitlPending>()
  private listeners = new Set<Listener>()

  await(id: string): Promise<HitlDecision> {
    return new Promise<HitlDecision>((resolve) => {
      this.pending.set(id, { id, resolve })
    })
  }

  resolve(id: string, decision: HitlDecision): boolean {
    const p = this.pending.get(id)
    if (!p) return false
    this.pending.delete(id)
    p.resolve(decision)
    for (const l of this.listeners) l({ id, decision })
    return true
  }

  has(id: string): boolean {
    return this.pending.has(id)
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

/** Singleton — a browser-wide bus. */
export const hitlBus = new HitlBus()
