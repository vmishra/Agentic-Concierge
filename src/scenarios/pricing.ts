/**
 * Live pricing re-computation.
 *
 * When the guest selects a different hospitality tier or a different hotel
 * from an option card grid, the pricing_breakdown artifact should update in
 * place so the total reflects their choice. This helper scans the current
 * artifacts for the scenario's tier + hotel grids, reads which option is
 * marked `selected`, and rebuilds the matching pricing_breakdown with a
 * fresh line for each line item.
 */

import type { A2UIArtifact, Money } from '@/adk/a2ui'
import { hospitality } from '@/data/hospitality'
import { hotels } from '@/data/hotels'

type Scaled = { amount: number; currency: Money['currency'] }
function scale(m: Money, factor: number): Scaled {
  return { amount: Math.round(m.amount * factor), currency: m.currency }
}

interface PricingScenario {
  tierGridId: string
  hotelGridId: string
  priceArtifactIds: string[]
  /** Hospitality: per-person × N */
  tierMultiplier: number
  /** Hotel: nightlyFrom × N */
  hotelMultiplier: number
  flightsLine: { label: string; amount: Money }
  extrasLine: { label: string; amount: Money; tone?: 'muted' | 'neutral' | 'accent' }
  hotelLabel: (hotelName: string) => string
  tierLabel: (tierName: string) => string
  hotelDetail?: string
  title: string
  note: string
}

const scenarios: PricingScenario[] = [
  {
    // F1 — 4 guests × 3 days hospitality, 3 nights hotel
    tierGridId: 'tiers.f1',
    hotelGridId: 'hotels.f1',
    priceArtifactIds: ['price.f1', 'budget.f1'],
    tierMultiplier: 4,
    hotelMultiplier: 3,
    flightsLine: { label: 'Flights · Mumbai ⇄ Abu Dhabi, business', amount: { amount: 72_000 * 4 * 2, currency: 'INR' } },
    extrasLine: { label: 'Accessible transfers + hospitality fees', amount: { amount: 180_000, currency: 'INR' }, tone: 'muted' },
    hotelLabel: (n) => `Hotel · ${n}, 3 nights`,
    tierLabel: (n) => `Hospitality · ${n}, 4 guests × 3 days`,
    hotelDetail: 'Step-free suite + adjoining room',
    title: 'Package · Abu Dhabi Grand Prix weekend',
    note: 'Quoted in INR with taxes included.',
  },
  {
    // Wimbledon — 6 guests × 2 days hospitality, 5 nights × 2 rooms
    tierGridId: 'tiers.wim',
    hotelGridId: 'hotels.wim',
    priceArtifactIds: ['price.wim', 'b.wim'],
    tierMultiplier: 12, // 6 × 2 days
    hotelMultiplier: 10, // 5 nights × 2 rooms
    flightsLine: { label: 'Flights · business, return', amount: { amount: 235_000 * 6 * 2, currency: 'INR' } },
    extrasLine: { label: 'Cultural + private transfers', amount: { amount: 360_000, currency: 'INR' }, tone: 'muted' },
    hotelLabel: (n) => `${n}, 5 nights × 2 rooms`,
    tierLabel: (n) => `${n}, 6 guests × 2 days`,
    title: 'Package · Wimbledon fortnight',
    note: 'Quoted in INR with taxes.',
  },
  {
    // Cricket — 10 guests × 2 days hospitality, 2 nights × 5 rooms
    tierGridId: 'tiers.cr',
    hotelGridId: 'hotels.cr',
    priceArtifactIds: ['price.cr', 'b.cr'],
    tierMultiplier: 20, // 10 × 2 days
    hotelMultiplier: 10, // 2 nights × 5 rooms
    flightsLine: { label: '', amount: { amount: 0, currency: 'INR' } }, // cricket has no flights line
    extrasLine: { label: 'Welcome dinner + transfers + host', amount: { amount: 280_000, currency: 'INR' }, tone: 'muted' },
    hotelLabel: (n) => `${n}, 2 nights × 5 rooms`,
    tierLabel: (n) => `${n}, 10 guests × 2 days`,
    title: 'Package · Mumbai Test hospitality',
    note: 'INR with taxes.',
  },
]

function findGridSelection(artifacts: A2UIArtifact[], gridId: string): string | undefined {
  const grid = artifacts.find((a) => a.id === gridId && a.kind === 'option_card_grid')
  if (!grid || grid.kind !== 'option_card_grid') return undefined
  const sel = grid.options.find((o) => o.selected)
  return sel?.id
}

function sum(...amounts: Money[]): Money {
  return { amount: amounts.reduce((s, m) => s + m.amount, 0), currency: amounts[0]?.currency ?? 'INR' }
}

/**
 * Given the current artifact set, rebuild any pricing_breakdown the user's
 * selections affect. If no pricing artifact is present for a scenario, the
 * function is a no-op for that scenario (we never conjure pricing out of
 * thin air — only update what was already rendered).
 */
export function recomputePricing(artifacts: A2UIArtifact[]): A2UIArtifact[] {
  let next = artifacts
  for (const sc of scenarios) {
    const tierId = findGridSelection(next, sc.tierGridId)
    const hotelId = findGridSelection(next, sc.hotelGridId)
    if (!tierId && !hotelId) continue

    const tier = tierId ? hospitality.find((h) => h.id === tierId) : undefined
    const hotel = hotelId ? hotels.find((h) => h.id === hotelId) : undefined

    next = next.map((a) => {
      if (a.kind !== 'pricing_breakdown' || !sc.priceArtifactIds.includes(a.id)) return a
      const lines = a.lines.map((line) => {
        // Replace the hospitality line when we have a new tier
        if (tier && /hospitality|court|pavilion|corporate box|trophy|paddock/i.test(line.label)) {
          return { ...line, label: sc.tierLabel(tier.name), amount: scale(tier.perPerson, sc.tierMultiplier) }
        }
        // Replace the hotel line when we have a new hotel
        if (hotel && /hotel|waldorf|connaught|taj|oberoi|four seasons|ritz|emirates|rosewood|du vin/i.test(line.label)) {
          return {
            ...line,
            label: sc.hotelLabel(hotel.name),
            amount: scale(hotel.nightlyFrom, sc.hotelMultiplier),
            detail: sc.hotelDetail ?? line.detail,
          }
        }
        return line
      })
      const total = sum(...lines.map((l) => l.amount))
      return { ...a, lines, total }
    })
  }
  return next
}
