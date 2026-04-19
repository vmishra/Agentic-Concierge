import type { Beat, ScenarioScript } from '@/adk/providers/mock'
import { findEvent } from '@/data/events'
import { hotelsIn, type Hotel } from '@/data/hotels'
import { hospitalityForEvent, type HospitalityTier } from '@/data/hospitality'
import {
  artifactId,
  chip,
  fmt,
  hotelCard,
  isPostTool,
  lastMessage,
  matchUser,
  openers,
  sum,
  tierCard,
  toolResult,
} from './helpers'
import type { Money } from '@/adk/a2ui'

const EVENT_ID = 'wimbledon-26'
const CITY = 'London'

const intro: Beat = {
  id: 'concierge.wim.intro',
  match: (input) =>
    !isPostTool(input) &&
    matchUser(input, /wimbledon|grass(-| )?court|sw19|tennis/i) &&
    !input.messages.some((m) => m.role === 'assistant' && m.agent === 'Concierge' && m.content.length > 10),
  steps: () => [
    { kind: 'trace', event: { kind: 'skill.load', skill: 'event-catalog', tools: ['search_events'] } },
    { kind: 'trace', event: { kind: 'skill.load', skill: 'dietary-accessibility', tools: ['plan_arrangements'] } },
    { kind: 'say', text: 'A fortnight of grass-court tennis for a family group. ' + openers.checkingAvailability + ' ' },
    {
      kind: 'toolCall',
      name: 'agent.Researcher',
      args: { task: 'Confirm the 2026 Wimbledon window and family-friendly day of play.' },
      id: 'w.r',
    },
    {
      kind: 'toolCall',
      name: 'agent.Logistics',
      args: { task: 'Shortlist family-friendly London hotels, Wimbledon side preferred.' },
      id: 'w.l',
    },
    {
      kind: 'toolCall',
      name: 'agent.Experience',
      args: { task: 'Wimbledon hospitality tiers that work for a family of six.' },
      id: 'w.e',
    },
    {
      kind: 'toolCall',
      name: 'agent.Budget',
      args: { task: 'Wimbledon family package baseline for 3 adults + 3 children, 5 nights.' },
      id: 'w.b',
    },
  ],
}

const assemble: Beat = {
  id: 'concierge.wim.assemble',
  match: (input) => isPostTool(input) && input.messages.some((m) => m.toolName === 'agent.Budget'),
  steps: () => [
    { kind: 'say', text: 'Drafting a five-day shape: first Saturday, middle Sunday, a museum day, and Ladies\' Final. ' },
    {
      kind: 'artifact',
      artifact: {
        kind: 'itinerary',
        id: artifactId('itin.wim'),
        title: 'Wimbledon · a family fortnight',
        subtitle: 'Tennis, a V&A morning, a West End evening — paced for children aged 8 to 14.',
        days: [
          {
            id: 'd1',
            date: 'Fri 3 Jul',
            title: 'Arrivals · settle in',
            blocks: [
              { time: '11:30', title: 'Heathrow arrival', subtitle: 'Private transfer to Mayfair' },
              { time: '15:00', title: 'Hotel check-in', subtitle: 'Family suites with adjoining rooms' },
              { time: '19:00', title: 'Early dinner', subtitle: 'Quiet corner, kid-friendly menu' },
            ],
          },
          {
            id: 'd2',
            date: 'Sat 4 Jul',
            title: 'No.1 Court hospitality',
            blocks: [
              { time: '11:00', title: 'Walk to Wimbledon village', subtitle: 'Strawberries and grounds' },
              { time: '13:00', title: 'Pavilion lunch', subtitle: 'Vegan + gluten-free flagged', tag: 'dietary' },
              { time: '14:30', title: 'No.1 Court matches', subtitle: 'All-day reserved seats' },
            ],
          },
          {
            id: 'd3',
            date: 'Sun 5 Jul',
            title: 'V&A morning · quiet evening',
            blocks: [
              { time: '10:00', title: 'V&A family tour', subtitle: 'Private guide, 90 minutes' },
              { time: '14:00', title: 'Regents Park open air theatre', subtitle: 'Age-appropriate matinee' },
              { time: '19:30', title: 'Early dinner in Marylebone' },
            ],
          },
          {
            id: 'd4',
            date: 'Mon 6 Jul',
            title: 'Centre Court debenture',
            blocks: [
              { time: '11:30', title: 'Debenture lounge lunch', subtitle: 'Three-course, quiet room' },
              { time: '13:00', title: 'Centre Court', subtitle: 'Debenture seats, all day' },
              { time: '19:00', title: 'Strawberries and a walk' },
            ],
          },
          {
            id: 'd5',
            date: 'Tue 7 Jul',
            title: 'West End · departures',
            blocks: [
              { time: '12:00', title: 'West End matinee', subtitle: 'Family-friendly show, box seats' },
              { time: '16:30', title: 'Late hotel check-out', subtitle: 'Rooms held until 18:00' },
              { time: '21:00', title: 'Departures', subtitle: 'Late-evening flights' },
            ],
          },
        ],
        refinements: [
          chip('w.r.quieter', 'A quieter hotel, closer to grounds', 'accent'),
          chip('w.r.childcare', 'Add childcare for the tennis days'),
          chip('w.r.debenture', 'Upgrade to Centre Court debenture'),
          chip('w.r.gift', 'Frame as an anniversary gift'),
        ],
      },
    },
    { kind: 'say', text: 'Two specialist shortlists remain on the workspace — we can swap any piece without redoing the rest.' },
  ],
}

const closer: Beat = {
  id: 'concierge.wim.debenture',
  match: (input) => !isPostTool(input) && matchUser(input, /debenture|centre court/i),
  steps: () => [
    { kind: 'say', text: 'Understood — upgrading to Centre Court debenture. ' },
    {
      kind: 'toolCall',
      name: 'agent.Experience',
      args: { task: 'Re-rank Wimbledon hospitality with Centre Court debenture as primary.' },
      id: 'w.e.deb',
    },
  ],
}

const closerPost: Beat = {
  id: 'concierge.wim.debenture-post',
  match: (input) => {
    const last = lastMessage(input)
    return (
      isPostTool(input) &&
      last?.toolName === 'agent.Experience' &&
      input.messages.some((m) => m.role === 'user' && /debenture|centre court/i.test(m.content))
    )
  },
  steps: () => [{ kind: 'say', text: 'Debenture seats held. Lunch in the members pavilion is included.' }],
}

const dossier: Beat = {
  id: 'concierge.wim.dossier',
  match: (input) => !isPostTool(input) && matchUser(input, /wimbledon/i) && matchUser(input, /proceed|confirm|book|lock|go ahead|let.?s (do|go)/i),
  steps: () => {
    const tier = hospitalityForEvent(EVENT_ID)[0]!
    const hotel = hotelsIn(CITY).find((h) => h.id === 'ld-connaught')!
    const lines = [
      { label: `${tier.name}, 6 guests × 2 days`, amount: scaleM(tier.perPerson, 12) },
      { label: `${hotel.name}, 5 nights (2 rooms)`, amount: scaleM(hotel.nightlyFrom, 10) },
      { label: 'Flights · business, return', amount: { amount: 235_000 * 6 * 2, currency: 'INR' } as Money },
      { label: 'Cultural + private transfers', amount: { amount: 360_000, currency: 'INR' } as Money, tone: 'muted' as const },
    ]
    const total = sum(lines.map((l) => l.amount))
    return [
      { kind: 'say', text: 'Drafting the dossier now. ' },
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('price.wim'),
          title: 'Package · Wimbledon fortnight',
          lines,
          total,
          note: 'Quoted in INR with taxes. A downgrade to No.1 Court across all days trims ~₹5.5L.',
        },
      },
      {
        kind: 'artifact',
        artifact: {
          kind: 'dossier',
          id: artifactId('dossier.wim'),
          title: 'Wimbledon · July 2026',
          summary: 'A fortnight for a family of six, paced with tennis and culture.',
          meta: [
            { label: 'guests', value: '6 (3 + 3)' },
            { label: 'nights', value: '5' },
            { label: 'window', value: '3–7 Jul 2026' },
            { label: 'total', value: fmt(total) },
          ],
          sections: [
            {
              title: 'The arrangement',
              body:
                'The Connaught in Mayfair with adjoining family suites; No.1 Court hospitality on Saturday, Centre Court on Monday; V&A private tour, a West End matinee, and quiet dinners.',
            },
            {
              title: 'Kept in mind',
              body:
                'Vegan and gluten-free pre-briefed with the pavilion kitchen; an age-appropriate cultural plan for the children.',
            },
            {
              title: 'What happens next',
              body:
                'Holding the suites and the debenture for 48 hours. A single consolidated invoice goes out once you confirm.',
            },
          ],
        },
      },
    ]
  },
}

function scaleM(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency }
}

const researchPre: Beat = {
  id: 'r.wim.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /wimbledon|tennis/i),
  steps: () => [
    { kind: 'trace', event: { kind: 'research.step', step: 1, question: 'Confirm the 2026 Championships window.', status: 'plan' } },
    { kind: 'toolCall', name: 'search_events', args: { query: 'Wimbledon' }, id: 'w.r.search' },
  ],
}

const researchPost: Beat = {
  id: 'r.wim.post',
  match: (input) => isPostTool(input) && matchUser(input, /wimbledon|tennis/i),
  steps: () => {
    const ev = findEvent(EVENT_ID)
    return [
      { kind: 'trace', event: { kind: 'research.step', step: 2, question: 'Identify family-friendly days of play.', status: 'search' } },
      { kind: 'trace', event: { kind: 'research.step', step: 3, question: 'Check pavilion dietary flexibility.', status: 'critique' } },
      { kind: 'trace', event: { kind: 'research.step', step: 4, question: 'Finalise the family-facing brief.', status: 'refine' } },
      {
        kind: 'artifact',
        artifact: {
          kind: 'research_scratchpad',
          id: artifactId('research.wim'),
          title: 'Deep research · Wimbledon 2026',
          subtitle: 'Four iterations; family-first framing.',
          steps: [
            { id: 's1', question: 'Window?', status: 'refined', findings: `${ev?.window}.` },
            { id: 's2', question: 'Best family days?', status: 'refined', findings: 'First Saturday (outer courts + No.1 Court) and Middle Monday (quieter debenture).' },
            { id: 's3', question: 'Pavilion dietary?', status: 'refined', findings: 'Vegan and gluten-free pre-brief accepted 48h ahead.' },
            { id: 's4', question: 'Age-appropriate cultural?', status: 'refined', findings: 'V&A family tour + Regents Park matinee consistently rated.' },
          ],
        },
      },
      { kind: 'say', text: 'Window confirmed; pavilion dietary handled; a quiet cultural day included.' },
    ]
  },
}

const logisticsPre: Beat = {
  id: 'l.wim.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /wimbledon|london|tennis|hotel/i),
  steps: () => [
    { kind: 'toolCall', name: 'hotels_near_event', args: { city: CITY }, id: 'w.l.h' },
  ],
}

const logisticsPost: Beat = {
  id: 'l.wim.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'hotels_near_event') && matchUser(input, /wimbledon|london|tennis/i),
  steps: (input) => {
    const list = toolResult<Hotel[]>(input, 'hotels_near_event') ?? hotelsIn(CITY)
    const options = list.slice(0, 3).map((h, i) => hotelCard(h, i === 0 ? 'family-friendly' : i === 1 ? 'closest to grounds' : undefined))
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('hotels.wim'),
          title: 'London hotels · family fortnight',
          subtitle: 'Mayfair calm, Wimbledon village, or central between the two.',
          columns: 3,
          options,
          refinements: [
            chip('w.h.close', 'Closer to the grounds'),
            chip('w.h.central', 'More central for culture'),
            chip('w.h.compare', 'Compare these three'),
          ],
        },
      },
      { kind: 'say', text: 'The Connaught is quietly the best-run lobby for a family; Hotel du Vin puts you on the common.' },
    ]
  },
}

const experiencePre: Beat = {
  id: 'e.wim.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /wimbledon|debenture|hospitality|tennis/i),
  steps: () => [{ kind: 'toolCall', name: 'tiers_for_event', args: { eventId: EVENT_ID }, id: 'w.e.t' }],
}

const experiencePost: Beat = {
  id: 'e.wim.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'tiers_for_event') && matchUser(input, /wimbledon|debenture|tennis/i),
  steps: (input) => {
    const list = toolResult<HospitalityTier[]>(input, 'tiers_for_event') ?? hospitalityForEvent(EVENT_ID)
    const userText = (input.messages[input.messages.length - 3]?.content ?? '').toLowerCase()
    const preferDebenture = /debenture|centre/i.test(userText)
    let sorted = [...list]
    if (preferDebenture) sorted.sort((a, b) => (b.tier === 'debenture' ? 1 : 0) - (a.tier === 'debenture' ? 1 : 0))
    const options = sorted.slice(0, 3).map((t, i) =>
      tierCard(t, preferDebenture && i === 0 ? 'Centre Court' : i === 0 ? 'family-friendly' : undefined),
    )
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('tiers.wim'),
          title: preferDebenture ? 'Hospitality — Centre Court first' : 'Hospitality — three tiers',
          subtitle: preferDebenture ? 'Debenture holds the best lunch and the quieter lounge.' : 'Pavilion to debenture, priced per person.',
          columns: 3,
          options,
          refinements: preferDebenture
            ? [chip('w.t.compare', 'Compare these three'), chip('w.t.ladiesfinal', 'Hold Ladies\' Final seats')]
            : [
                chip('w.t.debenture', 'Upgrade to Centre Court debenture', 'accent'),
                chip('w.t.quieter', 'Quietest pavilion day'),
                chip('w.t.compare', 'Compare these three'),
              ],
        },
      },
      {
        kind: 'say',
        text: preferDebenture
          ? 'Debenture first; No.1 Court is the calmer alternate if the children prefer a shorter day.'
          : 'Three tiers: pavilion for the children\'s day, No.1 Court for the family day, debenture for the adults\' day.',
      },
    ]
  },
}

const budgetBeat: Beat = {
  id: 'b.wim',
  match: (input) => matchUser(input, /wimbledon|tennis/i),
  steps: () => {
    const tier = hospitalityForEvent(EVENT_ID)[0]!
    const hotel = hotelsIn(CITY)[0]!
    const lines = [
      { label: `${tier.name}, 6 × 2 days`, amount: scaleM(tier.perPerson, 12) },
      { label: `${hotel.name}, 5 nights × 2 rooms`, amount: scaleM(hotel.nightlyFrom, 10) },
      { label: 'Flights · business, return', amount: { amount: 235_000 * 6 * 2, currency: 'INR' } as Money },
      { label: 'Cultural + transfers', amount: { amount: 360_000, currency: 'INR' } as Money, tone: 'muted' as const },
    ]
    const total = sum(lines.map((l) => l.amount))
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('b.wim'),
          title: 'Budget · family fortnight baseline',
          lines,
          total,
          note: 'A debenture upgrade for the adults adds ~₹11L across the group.',
        },
      },
      { kind: 'say', text: 'Inside most family-fortnight caps; we can trim the cultural day to close room.' },
    ]
  },
}

export const wimbledonScript: ScenarioScript = {
  name: 'wimbledon',
  beats: {
    Concierge: [closer, closerPost, dossier, intro, assemble],
    Researcher: [researchPre, researchPost],
    Logistics: [logisticsPre, logisticsPost],
    Experience: [experiencePre, experiencePost],
    Budget: [budgetBeat],
    Personalizer: [],
  },
}
