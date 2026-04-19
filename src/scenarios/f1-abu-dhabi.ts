/**
 * F1 Abu Dhabi — the canonical demo scenario.
 *
 * A small corporate group (4 guests) wants a three-day F1 Abu Dhabi package,
 * one of them uses a wheelchair, budget around ₹50L. The scenario branches on
 * refinement: closer to the pit lane, paddock meet windows, remembered
 * preferences.
 */

import type { Beat, ScenarioScript } from '@/adk/providers/mock'
import { findEvent } from '@/data/events'
import { hotelsIn } from '@/data/hotels'
import { hospitalityForEvent } from '@/data/hospitality'
import {
  accessibleHotelsIn,
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
import type { A2UIArtifact, Money } from '@/adk/a2ui'
import type { Hotel } from '@/data/hotels'
import type { HospitalityTier } from '@/data/hospitality'

const EVENT_ID = 'f1-abu-dhabi-25'
const CITY = 'Abu Dhabi'

// ---------------------------------------------------------------------------
// CONCIERGE — the voice. Orchestrates everything via sub-agents.
// ---------------------------------------------------------------------------

const conciergeIntro: Beat = {
  id: 'concierge.f1.intro',
  match: (input) =>
    !isPostTool(input) &&
    matchUser(input, /f1|formula|abu dhabi|yas marina/i) &&
    !input.messages.some((m) => m.role === 'assistant' && m.agent === 'Concierge' && m.content.length > 10),
  steps: () => [
    { kind: 'trace', event: { kind: 'skill.load', skill: 'event-catalog', tools: ['search_events', 'get_event'] } },
    {
      kind: 'trace',
      event: { kind: 'skill.load', skill: 'dietary-accessibility', tools: ['plan_arrangements'] },
    },
    { kind: 'say', text: 'A late-November weekend at Yas Marina, with accessibility threaded through. ' },
    { kind: 'say', text: openers.checkingAvailability + ' ', gapMs: 120 },
    {
      kind: 'toolCall',
      name: 'agent.Researcher',
      args: {
        task: 'Research the F1 Abu Dhabi weekend — confirm window, accessibility, and paddock access.',
        notes: '4 guests, late November 2025, one uses a wheelchair.',
      },
      id: 'call.research',
    },
    {
      kind: 'toolCall',
      name: 'agent.Logistics',
      args: {
        task: 'Shortlist hotels in Abu Dhabi, near Yas Marina, step-free.',
        notes: 'Group of 4, accessibility needed, three nights.',
      },
      id: 'call.logistics',
    },
    {
      kind: 'toolCall',
      name: 'agent.Experience',
      args: {
        task: 'Propose hospitality tiers for F1 Abu Dhabi weekend.',
        notes: 'Budget ~₹50L total; accessibility must be guaranteed.',
      },
      id: 'call.experience',
    },
    {
      kind: 'toolCall',
      name: 'agent.Budget',
      args: {
        task: 'Price breakdown for F1 Abu Dhabi, 4 guests, 3 nights, mid-tier hospitality.',
        notes: 'Cap ₹50L; call out upgrade and downgrade paths.',
      },
      id: 'call.budget',
    },
  ],
}

const conciergeAssemble: Beat = {
  id: 'concierge.f1.assemble',
  match: (input) => isPostTool(input) && input.messages.some((m) => m.toolName === 'agent.Budget'),
  steps: () => [
    { kind: 'say', text: 'Here is where I would start. ', gapMs: 120 },
    {
      kind: 'artifact',
      artifact: {
        kind: 'itinerary',
        id: artifactId('itin.f1'),
        title: 'Abu Dhabi Grand Prix — a three-day arrangement',
        subtitle: 'Friday arrivals, Saturday qualifying, Sunday race. Quiet mornings, marina evenings.',
        days: [
          {
            id: 'd1',
            date: 'Fri 28 Nov',
            title: 'Arrivals · first practice',
            blocks: [
              { time: '11:45', title: 'Private arrivals at AUH', subtitle: 'Accessible transfer to Yas Marina' },
              { time: '14:30', title: 'Hotel check-in', subtitle: 'Step-free suite confirmed; concierge on call' },
              { time: '17:00', title: 'FP1 — trackside welcome', subtitle: 'In-seat refreshments, shade from 17:00', tag: 'access' },
              { time: '20:30', title: 'Dinner on the marina', subtitle: 'Private room, quiet corner' },
            ],
          },
          {
            id: 'd2',
            date: 'Sat 29 Nov',
            title: 'Qualifying · Paddock Thursday walk-back',
            blocks: [
              { time: '10:00', title: 'Slow morning', subtitle: 'Breakfast in-suite; pool or spa optional' },
              { time: '14:00', title: 'Hospitality lounge opens', subtitle: 'Chef-led menu, accessible lift' },
              { time: '16:00', title: 'Qualifying — grandstand', subtitle: 'Step-free seating; marina side' },
              { time: '19:30', title: 'Driver Q&A', subtitle: 'Quieter crowd; request front row', tag: 'insider' },
            ],
          },
          {
            id: 'd3',
            date: 'Sun 30 Nov',
            title: 'Race day · championship finale',
            blocks: [
              { time: '11:00', title: 'Grid tour', subtitle: 'Hospitality suite access', tag: 'access' },
              { time: '14:00', title: 'Lunch at hospitality', subtitle: 'Plant-based + standard menu flagged' },
              { time: '17:00', title: 'Race — lights out', subtitle: 'Twilight into marina-lit laps' },
              { time: '20:00', title: 'Departures', subtitle: 'Late-evening flights accommodated' },
            ],
          },
        ],
        refinements: [
          chip('r.closer', 'Closer to the pit lane', 'accent'),
          chip('r.quieter', 'A quieter hotel'),
          chip('r.driver', 'Any driver meet windows?'),
          chip('r.gift', 'Frame this as a gift'),
        ],
      },
    },
    {
      kind: 'say',
      text: 'Three of our specialists each returned a shortlist — I will keep them visible in the workspace and we can refine together.',
    },
  ],
}

const conciergeCloser: Beat = {
  id: 'concierge.f1.closer-pitlane',
  match: (input) => !isPostTool(input) && matchUser(input, /closer to (the )?pit ?lane|pit lane|paddock( friendly)?/i),
  steps: () => [
    { kind: 'say', text: 'Understood — prioritising pit-lane proximity. ' },
    {
      kind: 'toolCall',
      name: 'agent.Experience',
      args: {
        task: 'Re-rank hospitality tiers for pit-lane proximity; prefer Paddock Club and Trophy Lounge.',
      },
      id: 'call.experience.pitlane',
    },
  ],
}

const conciergePitlanePost: Beat = {
  id: 'concierge.f1.closer-pitlane-post',
  match: (input) => {
    const last = lastMessage(input)
    return (
      isPostTool(input) &&
      last?.toolName === 'agent.Experience' &&
      input.messages.some((m) => m.role === 'user' && /pit ?lane|paddock/i.test(m.content))
    )
  },
  steps: () => [{ kind: 'say', text: 'Re-ranked. Paddock Club is the one with the widest pit-lane window.' }],
}

const conciergeResearchInsider: Beat = {
  id: 'concierge.f1.research-insider',
  match: (input) => !isPostTool(input) && matchUser(input, /driver|meet|norris|paddock walk|insider|money.can|upgrade/i),
  steps: () => [
    { kind: 'say', text: 'Let me see what quiet windows exist. ' },
    {
      kind: 'toolCall',
      name: 'agent.Researcher',
      args: {
        task: 'Find paddock meet-and-greet windows and grid-walk insider upgrades for the F1 Abu Dhabi weekend.',
      },
      id: 'call.research.insider',
    },
  ],
}

const conciergeInsiderPost: Beat = {
  id: 'concierge.f1.research-insider-post',
  match: (input) => {
    const last = lastMessage(input)
    return (
      isPostTool(input) &&
      last?.toolName === 'agent.Researcher' &&
      input.messages.some((m) => m.role === 'user' && /driver|meet|paddock walk|insider/i.test(m.content))
    )
  },
  steps: () => [
    { kind: 'say', text: 'Friday 15:00 is the quietest pit-lane walk window — it usually closes a week out. I can hold it now.' },
    {
      kind: 'artifact',
      artifact: {
        kind: 'note',
        id: artifactId('note.insider'),
        title: 'An insider window',
        tone: 'accent',
        body:
          'Pit-lane walk on Friday 15:00, ahead of FP2. The grid usually rotates teams on that walk; we would request the side furthest from Turn 1 for a quieter vantage.',
      },
    },
  ],
}

const conciergeRemember: Beat = {
  id: 'concierge.f1.remember',
  match: (input) => !isPostTool(input) && matchUser(input, /remember|note that|keep in mind|for (next|future)/i),
  steps: (input) => {
    const userText = input.messages[input.messages.length - 1]?.content ?? ''
    return [
      {
        kind: 'trace',
        event: { kind: 'memory.write', fact: userText.replace(/^(please )?remember\s*(that )?/i, '').trim() },
      },
      { kind: 'say', text: openers.remembering + ' ' },
      {
        kind: 'artifact',
        artifact: {
          kind: 'note',
          id: artifactId('note.mem'),
          title: 'Kept for next time',
          tone: 'success',
          body: 'Added to your preferences. Future arrangements will thread this in without needing to ask again.',
        },
      },
    ]
  },
}

const conciergeGift: Beat = {
  id: 'concierge.f1.gift',
  match: (input) => !isPostTool(input) && matchUser(input, /gift|gifting|frame as/i),
  steps: () => [
    { kind: 'say', text: 'Let me frame this the way it deserves. ' },
    {
      kind: 'toolCall',
      name: 'agent.Personalizer',
      args: {
        task: 'Draft a short gifting narrative for a corporate F1 Abu Dhabi weekend with accessibility threaded in.',
      },
      id: 'call.personalizer.gift',
    },
  ],
}

const conciergeGiftPost: Beat = {
  id: 'concierge.f1.gift-post',
  match: (input) => isPostTool(input) && lastMessage(input)?.toolName === 'agent.Personalizer',
  steps: () => [{ kind: 'say', text: 'The gifting framing is now visible alongside the itinerary.' }],
}

const conciergeDossier: Beat = {
  id: 'concierge.f1.dossier',
  match: (input) =>
    !isPostTool(input) && matchUser(input, /proceed|confirm|book|lock|go ahead|let.?s (do|go)/i),
  steps: (input) => {
    const tiers = hospitalityForEvent(EVENT_ID)
    const chosen: HospitalityTier = tiers[1]!
    const hotels = accessibleHotelsIn(CITY)
    const hotel: Hotel = hotels[0]!
    const lines = [
      { label: 'Hospitality · Trophy lounge, 4 guests × 3 days', amount: scaleM(chosen.perPerson, 4) },
      { label: 'Hotel · Waldorf Astoria, 3 nights', amount: scaleM(hotel.nightlyFrom, 3), detail: 'Step-free suite + adjoining room', tone: 'neutral' as const },
      { label: 'Flights · Mumbai ⇄ Abu Dhabi, business', amount: { amount: 72_000 * 4 * 2, currency: 'INR' as const } },
      { label: 'Accessible transfers + hospitality fees', amount: { amount: 180_000, currency: 'INR' as const }, tone: 'muted' as const },
    ]
    const total = sum(lines.map((l) => l.amount))
    const userAsked = input.messages[input.messages.length - 1]?.content ?? ''
    return [
      { kind: 'say', text: `Drafting the dossier now${userAsked ? ' — marked ready for review' : ''}. ` },
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('price.f1'),
          title: 'Package · Abu Dhabi Grand Prix weekend',
          lines,
          total,
          note: 'Quoted in INR with taxes included. Upgrades to Paddock Club add ~₹14L across the group.',
        },
      },
      {
        kind: 'artifact',
        artifact: {
          kind: 'dossier',
          id: artifactId('dossier.f1'),
          title: 'Abu Dhabi Grand Prix · November 2025',
          summary:
            'A three-day arrangement for four guests — threaded with accessibility, paddock proximity, and a quiet lunch on race day.',
          meta: [
            { label: 'guests', value: '4' },
            { label: 'nights', value: '3' },
            { label: 'window', value: '28–30 Nov 2025' },
            { label: 'total', value: fmt(total) },
          ],
          sections: [
            {
              title: 'The arrangement',
              body:
                'Waldorf Astoria on the marina, step-free suite with an adjoining room; Trophy Lounge hospitality for all three days; Friday pit-lane walk held ahead of FP2; accessible transfers tied to the lounge entry.',
            },
            {
              title: 'Kept in mind',
              body:
                'Plant-based menu flagged with the hospitality kitchen. Quiet front-row seating requested for the Saturday Q&A. A low-floor transfer vehicle is assigned for all circuit movements.',
            },
            {
              title: 'What happens next',
              body:
                'I hold the Friday pit-lane walk and the Trophy hospitality for 48 hours. When you confirm, I will issue confirmations to each guest and a single consolidated invoice.',
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

// ---------------------------------------------------------------------------
// RESEARCHER — deep-research LoopAgent, visibly iterating.
// ---------------------------------------------------------------------------

const researcherPre: Beat = {
  id: 'research.f1.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /f1|abu dhabi|yas marina|formula/i),
  steps: () => [
    {
      kind: 'trace',
      event: { kind: 'research.step', step: 1, question: 'Confirm the official F1 Abu Dhabi weekend window.', status: 'plan' },
    },
    {
      kind: 'toolCall',
      name: 'search_events',
      args: { query: 'Abu Dhabi Formula 1' },
      id: 'r.search',
    },
  ],
}

const researcherPost: Beat = {
  id: 'research.f1.post',
  match: (input) => isPostTool(input) && matchUser(input, /f1|abu dhabi|yas marina/i),
  steps: (input) => {
    const found = toolResult<Array<{ id: string; name: string; window: string }>>(input, 'search_events') ?? []
    const ev = findEvent(EVENT_ID)
    return [
      {
        kind: 'trace',
        event: { kind: 'research.step', step: 2, question: 'Confirm travel feasibility and accessibility from catalog.', status: 'search' },
      },
      {
        kind: 'trace',
        event: { kind: 'research.step', step: 3, question: 'Check coverage gaps — any missed windows?', status: 'critique' },
      },
      {
        kind: 'trace',
        event: { kind: 'research.step', step: 4, question: 'Finalise the brief.', status: 'refine' },
      },
      {
        kind: 'artifact',
        artifact: {
          kind: 'research_scratchpad',
          id: artifactId('research.f1'),
          title: 'Deep research · F1 Abu Dhabi weekend',
          subtitle: 'Four sub-questions, iterated twice — findings consolidated below.',
          steps: [
            {
              id: 's1',
              question: 'What is the official race window?',
              status: 'refined',
              findings: `${ev?.window} at ${ev?.venue}. Twilight start means late arrivals are fine.`,
              sources: [{ label: 'event catalog', hint: 'internal' }],
            },
            {
              id: 's2',
              question: 'Is accessibility guaranteed across the circuit?',
              status: 'refined',
              findings:
                'Yas Marina publishes an accessibility map with step-free entries from the north and marina gates. Grandstands at turns 5 and 14 have reserved accessible seating; hospitality suites have lift access.',
              sources: [{ label: 'venue brief', hint: 'partner' }],
            },
            {
              id: 's3',
              question: 'Are paddock meet windows available?',
              status: 'refined',
              findings:
                'Yes — Friday 15:00 pit-lane walk is the quietest window; Thursday walkthrough is open to Trophy + Paddock Club. Driver Q&A is livelier mid-week.',
              sources: [{ label: 'hospitality ops', hint: 'internal' }],
            },
            {
              id: 's4',
              question: 'What should the hotel radius be?',
              status: 'refined',
              findings:
                'Hotels within 1 km of the circuit reduce transfer load for accessibility; Waldorf and the St Regis Saadiyat qualify.',
              sources: [{ label: 'logistics partner', hint: 'vetted' }],
            },
          ],
        },
      },
      {
        kind: 'say',
        text:
          `Confirmed: ${ev?.name} at ${ev?.venue}, ${ev?.window}. Accessibility guaranteed via the marina gate; Friday 15:00 pit-lane walk is the calmest window. (${found.length} event match${found.length === 1 ? '' : 'es'} from the catalog.)`,
      },
    ]
  },
}

const researcherInsiderPre: Beat = {
  id: 'research.insider.pre',
  match: (input) =>
    !isPostTool(input) &&
    matchUser(input, /paddock meet|driver|norris|grid walk|insider|money.can/i),
  steps: () => [
    {
      kind: 'trace',
      event: { kind: 'research.step', step: 1, question: 'Scan for paddock meet windows and driver interactions.', status: 'plan' },
    },
    {
      kind: 'toolCall',
      name: 'search_events',
      args: { query: 'Abu Dhabi' },
      id: 'r.insider',
    },
  ],
}

const researcherInsiderPost: Beat = {
  id: 'research.insider.post',
  match: (input) => isPostTool(input) && matchUser(input, /paddock meet|driver|norris|grid walk|insider/i),
  steps: () => [
    {
      kind: 'trace',
      event: { kind: 'research.step', step: 2, question: 'Cross-check with hospitality partner pit-lane schedule.', status: 'search' },
    },
    {
      kind: 'trace',
      event: { kind: 'research.step', step: 3, question: 'Confirm availability against team rotation.', status: 'critique' },
    },
    {
      kind: 'trace',
      event: { kind: 'research.step', step: 4, question: 'Hold the best window; note the alternative.', status: 'refine' },
    },
    {
      kind: 'say',
      text:
        'Friday 15:00 pit-lane walk is open and the quietest window. Driver Q&A Saturday 19:30 has front-row access for Trophy+; we would request front row.',
    },
  ],
}

// ---------------------------------------------------------------------------
// LOGISTICS — hotels + transfers.
// ---------------------------------------------------------------------------

const logisticsPre: Beat = {
  id: 'logistics.f1.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /abu dhabi|yas|hotel|step-free|accessibility/i),
  steps: () => [
    {
      kind: 'toolCall',
      name: 'hotels_near_event',
      args: { city: CITY, accessibility: true },
      id: 'l.hotels',
    },
  ],
}

const logisticsPost: Beat = {
  id: 'logistics.f1.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'hotels_near_event'),
  steps: (input) => {
    const list = toolResult<Hotel[]>(input, 'hotels_near_event') ?? hotelsIn(CITY)
    const sorted = [...list].sort((a, b) => a.distanceToVenueKm - b.distanceToVenueKm)
    const options = sorted.slice(0, 3).map((h, i) =>
      hotelCard(h, i === 0 ? 'closest to the circuit' : i === 2 ? 'ceremonial' : undefined),
    )
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('hotels.f1'),
          title: 'Three hotels, threaded with accessibility',
          subtitle: 'Ranked by distance to the marina gate; all step-free.',
          columns: 3,
          options,
          refinements: [
            chip('h.ceremonial', 'Something more ceremonial', 'accent'),
            chip('h.quiet', 'Quieter, further from the circuit'),
            chip('h.compare', 'Compare these three'),
          ],
        },
      },
      {
        kind: 'say',
        text: 'The Waldorf is a five-minute walk to the south paddock gate; the Emirates Palace is a ceremonial option if the landing matters.',
      },
    ]
  },
}

// ---------------------------------------------------------------------------
// EXPERIENCE — hospitality tiers.
// ---------------------------------------------------------------------------

const experiencePre: Beat = {
  id: 'experience.f1.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /hospitality|paddock|grandstand|trophy|tier|experience|f1|abu dhabi/i),
  steps: () => [
    {
      kind: 'toolCall',
      name: 'tiers_for_event',
      args: { eventId: EVENT_ID },
      id: 'e.tiers',
    },
  ],
}

const experiencePost: Beat = {
  id: 'experience.f1.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'tiers_for_event'),
  steps: (input) => {
    const list = toolResult<HospitalityTier[]>(input, 'tiers_for_event') ?? hospitalityForEvent(EVENT_ID)
    // Infer a "pit-lane" re-rank from the latest user text
    const userText = (input.messages[input.messages.length - 3]?.content ?? '').toLowerCase()
    const preferPaddock = /pit|paddock|closer/.test(userText)
    let sorted = [...list]
    if (preferPaddock) {
      sorted.sort((a, b) => (rankPaddock(b) - rankPaddock(a)))
    }
    const options = sorted.slice(0, 3).map((t, i) =>
      tierCard(t, preferPaddock && i === 0 ? 'closest to pit lane' : i === 0 ? 'balanced' : undefined),
    )
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('tiers.f1'),
          title: preferPaddock ? 'Hospitality — re-ranked for pit-lane proximity' : 'Hospitality — three tiers to consider',
          subtitle: preferPaddock ? 'Paddock Club is the widest pit-lane window.' : 'Grandstand to Paddock Club, priced per person.',
          columns: 3,
          options,
          refinements: preferPaddock
            ? [chip('t.compare', 'Compare these three'), chip('t.upgrade', 'Upgrade one guest to Paddock', 'accent')]
            : [
                chip('t.closer', 'Closer to the pit lane', 'accent'),
                chip('t.value', 'Best value shortlist'),
                chip('t.compare', 'Compare these three'),
              ],
        },
      },
      {
        kind: 'say',
        text: preferPaddock
          ? 'Paddock Club is the widest pit-lane window; Trophy sits a step below with a more generous lounge.'
          : 'Three tiers: grandstand for proximity at lower cost, Trophy for a covered lounge, Paddock Club for pit-lane walks.',
      },
    ]
  },
}

function rankPaddock(t: HospitalityTier): number {
  if (t.tier === 'paddock') return 3
  if (t.tier === 'hospitality-suite') return 2
  if (t.tier === 'suite') return 1.5
  return 0
}

// ---------------------------------------------------------------------------
// BUDGET — synthesises a pricing breakdown, no external tools.
// ---------------------------------------------------------------------------

const budgetBeat: Beat = {
  id: 'budget.f1',
  match: (input) => matchUser(input, /f1|abu dhabi|budget|price|cost/i),
  steps: (input) => {
    const tiers = hospitalityForEvent(EVENT_ID)
    const trophyOrMid = tiers[1] ?? tiers[0]!
    const hotel = accessibleHotelsIn(CITY)[0]!
    const lines = [
      {
        label: `Hospitality · ${trophyOrMid.name}, 4 guests × 3 days`,
        amount: scaleM(trophyOrMid.perPerson, 4) as Money,
      },
      {
        label: `Hotel · ${hotel.name}, 3 nights`,
        amount: scaleM(hotel.nightlyFrom, 3) as Money,
      },
      {
        label: 'Flights · Business, return',
        amount: { amount: 72_000 * 4 * 2, currency: 'INR' as const },
      },
      {
        label: 'Transfers + hospitality fees + service',
        amount: { amount: 180_000, currency: 'INR' as const },
        tone: 'muted' as const,
      },
    ]
    const total = sum(lines.map((l) => l.amount))
    void input
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('budget.f1'),
          title: 'Budget · mid-tier baseline',
          lines,
          total,
          note: 'Comfortably inside a ₹50L cap. A move to Paddock Club adds ~₹14.5L; a move to Emirates Palace adds ~₹2.1L.',
        },
      },
      {
        kind: 'say',
        text: 'Well inside ₹50L with room to upgrade one or two guests to Paddock.',
      },
    ]
  },
}

// ---------------------------------------------------------------------------
// PERSONALIZER — gifting narrative, memory read.
// ---------------------------------------------------------------------------

const personalizerBeat: Beat = {
  id: 'personalizer.f1',
  match: () => true,
  steps: () => [
    {
      kind: 'artifact',
      artifact: {
        kind: 'note',
        id: artifactId('gift.f1'),
        title: 'A gifting framing',
        tone: 'accent',
        body:
          'A quiet landing in Abu Dhabi, threaded with accessibility and small moments of insider access. Nothing announced — everything considered.',
      } as A2UIArtifact,
    },
    { kind: 'say', text: 'Narrative drafted and kept alongside the dossier.' },
  ],
}

// ---------------------------------------------------------------------------
// Export — the script.
// ---------------------------------------------------------------------------

export const f1AbuDhabiScript: ScenarioScript = {
  name: 'f1-abu-dhabi',
  beats: {
    Concierge: [
      conciergeCloser,
      conciergePitlanePost,
      conciergeResearchInsider,
      conciergeInsiderPost,
      conciergeRemember,
      conciergeGift,
      conciergeGiftPost,
      conciergeDossier,
      conciergeIntro,
      conciergeAssemble,
    ],
    Researcher: [researcherInsiderPre, researcherInsiderPost, researcherPre, researcherPost],
    Logistics: [logisticsPre, logisticsPost],
    Experience: [experiencePre, experiencePost],
    Budget: [budgetBeat],
    Personalizer: [personalizerBeat],
  },
}
