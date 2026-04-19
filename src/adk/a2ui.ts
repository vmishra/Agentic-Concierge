/**
 * A2UI — Agent-to-User-Interface protocol.
 *
 * The agent speaks in *components*, not HTML. The frontend maintains a
 * pre-approved catalog and renders from it. This keeps the surface safe
 * (no arbitrary markup), portable (agents don't know about our design tokens),
 * and updatable (change the renderer, all past artifacts re-theme).
 */

export type Money = { amount: number; currency: 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED' }

export interface RefinementChip {
  id: string
  label: string
  /** Optional hint; if absent, label is sent as the user message. */
  prompt?: string
  /** Display hint. */
  tone?: 'neutral' | 'accent'
}

export interface ItineraryDay {
  id: string
  date: string
  title: string
  blocks: { time: string; title: string; subtitle?: string; tag?: string }[]
}

export interface OptionCard {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  image?: string
  bullets?: string[]
  price?: Money
  priceNote?: string
  badges?: { label: string; tone?: 'accent' | 'neutral' | 'success' }[]
  selected?: boolean
}

export interface ComparisonRow {
  attribute: string
  values: (string | number | Money | null)[]
}

export interface ResearchStep {
  id: string
  question: string
  status: 'planning' | 'searching' | 'critiquing' | 'refined'
  findings?: string
  sources?: { label: string; hint?: string }[]
}

/** One A2UI artifact — the union of every component the agent may emit. */
export type A2UIArtifact =
  | {
      kind: 'itinerary'
      id: string
      title: string
      subtitle?: string
      days: ItineraryDay[]
      refinements?: RefinementChip[]
    }
  | {
      kind: 'option_card_grid'
      id: string
      title: string
      subtitle?: string
      columns?: 1 | 2 | 3
      options: OptionCard[]
      refinements?: RefinementChip[]
    }
  | {
      kind: 'comparison_table'
      id: string
      title: string
      columns: string[]
      rows: ComparisonRow[]
    }
  | {
      kind: 'pricing_breakdown'
      id: string
      title: string
      lines: { label: string; detail?: string; amount: Money; tone?: 'neutral' | 'accent' | 'muted' }[]
      total: Money
      note?: string
    }
  | {
      kind: 'refinement_chips'
      id: string
      title?: string
      chips: RefinementChip[]
    }
  | {
      kind: 'research_scratchpad'
      id: string
      title: string
      subtitle?: string
      steps: ResearchStep[]
    }
  | {
      kind: 'map_preview'
      id: string
      title: string
      places: { name: string; subtitle?: string; lat: number; lng: number }[]
    }
  | {
      kind: 'dossier'
      id: string
      title: string
      summary: string
      sections: { title: string; body: string }[]
      meta?: { label: string; value: string }[]
    }
  | {
      kind: 'note'
      id: string
      title?: string
      body: string
      tone?: 'neutral' | 'accent' | 'success' | 'warning'
    }

export type A2UIKind = A2UIArtifact['kind']

export function artifactId(a: A2UIArtifact): string {
  return a.id
}
