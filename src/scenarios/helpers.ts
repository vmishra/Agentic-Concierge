import type { GenerateInput } from '@/adk/provider'
import type { A2UIArtifact, Money, OptionCard, RefinementChip } from '@/adk/a2ui'
import { hotels, type Hotel } from '@/data/hotels'
import { hospitality, type HospitalityTier } from '@/data/hospitality'
import { fmtMoney } from '@/lib/format'

/** Last message in the conversation, if any. */
export function lastMessage(input: GenerateInput) {
  return input.messages[input.messages.length - 1]
}

/** Have we just returned from tool execution? */
export function isPostTool(input: GenerateInput): boolean {
  const last = lastMessage(input)
  return last?.role === 'tool'
}

/** Return the most recent tool result by name, parsed as JSON. */
export function toolResult<T = unknown>(input: GenerateInput, name: string): T | undefined {
  for (let i = input.messages.length - 1; i >= 0; i--) {
    const m = input.messages[i]
    if (!m) continue
    if (m.role === 'tool' && m.toolName === name) {
      try {
        return JSON.parse(m.content) as T
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

export function matchUser(input: GenerateInput, re: RegExp): boolean {
  for (let i = input.messages.length - 1; i >= 0; i--) {
    const m = input.messages[i]
    if (!m) continue
    if (m.role === 'user') return re.test(m.content)
    if (m.role === 'tool') continue
  }
  return false
}

/**
 * Scenario lock-in — scans all prior user messages for scenario-specific
 * keywords so follow-up refinements (chip clicks, short phrases) route to
 * the correct scenario's beats even when the chip text itself is ambiguous.
 */
const SCENARIO_PATTERNS = {
  f1: /f1|formula|abu dhabi|yas marina|paddock|grand prix/i,
  wim: /wimbledon|sw19|grass.?court|debenture|centre court|pavilion\b/i,
  cr: /cricket|wankhede|test match|border.?gavaskar|india v australia|ind v aus/i,
} as const

export type ScenarioKind = keyof typeof SCENARIO_PATTERNS

export function isScenario(input: GenerateInput, kind: ScenarioKind): boolean {
  const re = SCENARIO_PATTERNS[kind]
  return input.messages.some((m) => m.role === 'user' && re.test(m.content))
}

/** Which scenario has the user committed to? Most-recent-wins if multiple. */
export function activeScenario(input: GenerateInput): ScenarioKind | undefined {
  for (let i = input.messages.length - 1; i >= 0; i--) {
    const m = input.messages[i]
    if (m?.role !== 'user') continue
    for (const k of Object.keys(SCENARIO_PATTERNS) as ScenarioKind[]) {
      if (SCENARIO_PATTERNS[k].test(m.content)) return k
    }
  }
  return undefined
}

export function userInputText(input: GenerateInput): string {
  for (let i = input.messages.length - 1; i >= 0; i--) {
    const m = input.messages[i]
    if (m?.role === 'user') return m.content
  }
  return ''
}

/** Build an OptionCard from a Hotel, with `selected` optional. */
export function hotelCard(h: Hotel, highlight?: string): OptionCard {
  return {
    id: h.id,
    eyebrow: h.tier === 'palace' ? 'palace' : h.tier === 'boutique' ? 'boutique' : 'five-star',
    title: h.name,
    subtitle: `${h.distanceToVenueKm.toFixed(1)} km from venue · ${h.city}`,
    bullets: [...h.amenities.slice(0, 3), h.notes],
    badges: [
      h.accessibility ? { label: 'step-free', tone: 'success' as const } : undefined,
      highlight ? { label: highlight, tone: 'accent' as const } : undefined,
    ].filter(Boolean) as OptionCard['badges'],
    price: h.nightlyFrom,
    priceNote: 'per night',
  }
}

export function tierCard(t: HospitalityTier, highlight?: string): OptionCard {
  const eyebrow =
    t.tier === 'paddock'
      ? 'paddock club'
      : t.tier === 'debenture'
        ? 'debenture'
        : t.tier === 'pavilion'
          ? 'pavilion'
          : t.tier === 'suite'
            ? 'suite'
            : t.tier === 'grandstand'
              ? 'grandstand'
              : 'hospitality'
  return {
    id: t.id,
    eyebrow,
    title: t.name,
    subtitle: t.insider,
    bullets: [...t.includes.slice(0, 3), ...t.access.slice(0, 1)],
    badges: highlight ? [{ label: highlight, tone: 'accent' }] : undefined,
    price: t.perPerson,
    priceNote: 'per person',
  }
}

export function sum(amounts: Money[]): Money {
  if (amounts.length === 0) return { amount: 0, currency: 'INR' }
  const currency = amounts[0]!.currency
  return {
    amount: amounts.reduce((a, b) => a + b.amount, 0),
    currency,
  }
}

export function scale(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency }
}

export function fmt(m: Money): string {
  return fmtMoney(m)
}

export { hotels, hospitality }

export function chip(id: string, label: string, tone?: RefinementChip['tone']): RefinementChip {
  return { id, label, tone }
}

export function accessibleHotelsIn(city: string): Hotel[] {
  return hotels.filter((h) => h.city === city && h.accessibility)
}

/**
 * Scenario artifact IDs are stable by base. When an agent re-emits an
 * artifact with the same base (e.g. "tiers.f1"), the workspace store
 * finds the existing id and replaces it — so refining a shortlist
 * updates the card in place rather than appending a duplicate.
 */
export function artifactId(base: string) {
  return base
}

/** Build a standard concierge-voice opener. */
export const openers = {
  arranging: 'One moment while I arrange this across our partners.',
  checkingAvailability: 'Let me check availability and thread the pieces together.',
  refining: 'Noted. Refining the shortlist now.',
  remembering: 'Noted and kept for future arrangements.',
}

export type { A2UIArtifact }
