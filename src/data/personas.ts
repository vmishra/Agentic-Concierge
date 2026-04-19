/**
 * Personas — a small set of demo users with remembered preferences. The
 * default persona is loaded on first use and seeds the long-term memory so
 * the "remembered from last time" trick works in a cold demo.
 */

export interface Persona {
  id: string
  name: string
  headline: string
  seedMemory: string[]
}

export const personas: Persona[] = [
  {
    id: 'default',
    name: 'You',
    headline: 'Curating with the concierge',
    seedMemory: [
      'Travels in groups of 4–6; prefers to be centralised in one hotel.',
      'Has previously enjoyed motorsport, Test cricket, and grass-court tennis.',
      'Time zone preference: flights arriving before local midnight.',
      'Prefers INR-denominated quotes with tax included.',
    ],
  },
]

export const defaultPersona = personas[0]!
