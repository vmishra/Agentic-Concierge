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

const EVENT_ID = 'ind-aus-test-26'
const CITY = 'Mumbai'

const intro: Beat = {
  id: 'concierge.cr.intro',
  match: (input) =>
    !isPostTool(input) &&
    matchUser(input, /cricket|wankhede|test (match|cricket)|border.?gavaskar|ind v aus|india v australia/i) &&
    !input.messages.some((m) => m.role === 'assistant' && m.agent === 'Concierge' && m.content.length > 10),
  steps: () => [
    { kind: 'trace', event: { kind: 'skill.load', skill: 'event-catalog', tools: ['search_events'] } },
    { kind: 'trace', event: { kind: 'skill.load', skill: 'gifting-narrative', tools: ['narrative_for'] } },
    { kind: 'say', text: 'A corporate group for five days of Test cricket in Mumbai. ' + openers.checkingAvailability + ' ' },
    { kind: 'toolCall', name: 'agent.Researcher', args: { task: 'Confirm the Wankhede Test window and weather risk.' }, id: 'c.r' },
    { kind: 'toolCall', name: 'agent.Logistics', args: { task: 'Shortlist South Mumbai hotels for a corporate group of 10.' }, id: 'c.l' },
    { kind: 'toolCall', name: 'agent.Experience', args: { task: 'Hospitality options at Wankhede for 10 guests with mixed preferences.' }, id: 'c.e' },
    { kind: 'toolCall', name: 'agent.Budget', args: { task: 'Test match corporate hospitality baseline for 10 guests, 3 days.' }, id: 'c.b' },
  ],
}

const assemble: Beat = {
  id: 'concierge.cr.assemble',
  match: (input) => isPostTool(input) && input.messages.some((m) => m.toolName === 'agent.Budget'),
  steps: () => [
    { kind: 'say', text: 'A three-day shape: corporate dinner, then two day-Tests with pavilion access. ' },
    {
      kind: 'artifact',
      artifact: {
        kind: 'itinerary',
        id: artifactId('itin.cr'),
        title: 'Wankhede Test · a three-day shape',
        subtitle: 'Corporate hospitality, a pre-event dinner, and a buffer day for the weather.',
        days: [
          {
            id: 'd1',
            date: 'Thu 11 Dec',
            title: 'Arrivals · team dinner',
            blocks: [
              { time: '14:00', title: 'Hotel check-in', subtitle: 'Taj Mahal Palace corporate floors' },
              { time: '19:30', title: 'Private dinner at Sea Lounge', subtitle: 'Briefing + insider on the teams', tag: 'briefing' },
            ],
          },
          {
            id: 'd2',
            date: 'Fri 12 Dec',
            title: 'Day one · pavilion',
            blocks: [
              { time: '08:30', title: 'Transfer to Wankhede', subtitle: 'Coach + lead-car host' },
              { time: '09:30', title: 'Corporate Box · Garware End', subtitle: 'Chef-led menu, open bar' },
              { time: '20:00', title: 'Return to hotel', subtitle: 'Sea-face dinner, informal' },
            ],
          },
          {
            id: 'd3',
            date: 'Sat 13 Dec',
            title: 'Day two · insider access',
            blocks: [
              { time: '09:30', title: 'Boundary-line welcome', subtitle: 'Team-side briefing with a former captain', tag: 'insider' },
              { time: '10:30', title: 'Corporate Box', subtitle: 'Continued hospitality' },
              { time: '19:30', title: 'Departures', subtitle: 'Staggered over the evening' },
            ],
          },
        ],
        refinements: [
          chip('c.r.insider', 'Insider briefing with a former captain', 'accent'),
          chip('c.r.split', 'Split the group across pavilion + club house'),
          chip('c.r.weather', 'What if the Test rolls over?'),
          chip('c.r.gift', 'Frame as a corporate gift'),
        ],
      },
    },
    { kind: 'say', text: 'Two specialist shortlists are kept visible on the workspace; we can swap any of them.' },
  ],
}

const insiderIntent: Beat = {
  id: 'concierge.cr.insider',
  match: (input) => !isPostTool(input) && matchUser(input, /insider|captain|briefing|intro/i),
  steps: () => [
    { kind: 'say', text: 'Let me see which former captain has a quiet window that morning. ' },
    { kind: 'toolCall', name: 'agent.Researcher', args: { task: 'Arrange a former-captain boundary-line briefing window.' }, id: 'c.r.insider' },
  ],
}

const insiderPost: Beat = {
  id: 'concierge.cr.insider.post',
  match: (input) => isPostTool(input) && lastMessage(input)?.toolName === 'agent.Researcher' && matchUser(input, /insider|captain|briefing/i),
  steps: () => [
    { kind: 'say', text: 'Held. The Saturday 09:30 window is quieter and allows a full hour before play.' },
    {
      kind: 'artifact',
      artifact: {
        kind: 'note',
        id: artifactId('note.insider.cr'),
        title: 'Insider briefing',
        tone: 'accent',
        body: 'A boundary-line briefing with a former India captain; 09:30 on day two, 45 minutes, off-record. Guests return to the pavilion for a formal lunch at 12:00.',
      },
    },
  ],
}

const weather: Beat = {
  id: 'concierge.cr.weather',
  match: (input) => !isPostTool(input) && matchUser(input, /weather|rain|reschedule|roll over|buffer/i),
  steps: () => [
    {
      kind: 'artifact',
      artifact: {
        kind: 'note',
        id: artifactId('note.weather'),
        title: 'If play rolls over',
        tone: 'warning',
        body:
          'A soft-hold on the hotel extends automatically into day five. Flights are marked flexible; transfers auto-resequence. If play is lost to weather on day two, the hospitality spend is credited 1:1.',
      },
    },
    { kind: 'say', text: 'Coverage is in place for weather and a roll-over day. Nothing needed from you.' },
  ],
}

const dossier: Beat = {
  id: 'concierge.cr.dossier',
  match: (input) => !isPostTool(input) && matchUser(input, /cricket|wankhede|test/i) && matchUser(input, /proceed|confirm|book|lock|go ahead|let.?s (do|go)/i),
  steps: () => {
    const tier = hospitalityForEvent(EVENT_ID)[0]!
    const hotel = hotelsIn(CITY).find((h) => h.id === 'mb-taj')!
    const lines = [
      { label: `${tier.name}, 10 guests × 2 days`, amount: scaleM(tier.perPerson, 20) },
      { label: `${hotel.name}, 2 nights × 5 rooms`, amount: scaleM(hotel.nightlyFrom, 10) },
      { label: 'Welcome dinner + transfers + host', amount: { amount: 280_000, currency: 'INR' } as Money, tone: 'muted' as const },
    ]
    const total = sum(lines.map((l) => l.amount))
    return [
      { kind: 'say', text: 'Drafting the dossier. ' },
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('price.cr'),
          title: 'Package · Mumbai Test hospitality',
          lines,
          total,
          note: 'INR with taxes. A move to the club-house pavilion trims ~₹8.8L and keeps the group together.',
        },
      },
      {
        kind: 'artifact',
        artifact: {
          kind: 'dossier',
          id: artifactId('dossier.cr'),
          title: 'India v Australia · Wankhede · December 2026',
          summary: 'Two days in a corporate box, threaded with insider access and a weather-proofed itinerary.',
          meta: [
            { label: 'guests', value: '10' },
            { label: 'nights', value: '2' },
            { label: 'window', value: '12–13 Dec 2026' },
            { label: 'total', value: fmt(total) },
          ],
          sections: [
            {
              title: 'The arrangement',
              body:
                'Taj Mahal Palace corporate floors; Corporate Box at the Garware End for both days; a Saturday boundary-line briefing with a former India captain; private dinners at the Sea Lounge.',
            },
            {
              title: 'Kept in mind',
              body:
                'Group first-time-travelling-together — a pre-event dinner as an icebreaker. Flights marked flexible for a roll-over Test.',
            },
            {
              title: 'What happens next',
              body:
                'Holding the corporate box and the briefing window for 48 hours. A single consolidated invoice goes out on confirmation.',
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
  id: 'r.cr.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /cricket|wankhede|test|border.?gavaskar/i),
  steps: () => [
    { kind: 'trace', event: { kind: 'research.step', step: 1, question: 'Confirm the Wankhede Test window.', status: 'plan' } },
    { kind: 'toolCall', name: 'search_events', args: { query: 'India Australia Test' }, id: 'c.r.s' },
  ],
}

const researchPost: Beat = {
  id: 'r.cr.post',
  match: (input) => isPostTool(input) && matchUser(input, /cricket|wankhede|test/i),
  steps: () => {
    const ev = findEvent(EVENT_ID)
    return [
      { kind: 'trace', event: { kind: 'research.step', step: 2, question: 'Check stadium hospitality inventory.', status: 'search' } },
      { kind: 'trace', event: { kind: 'research.step', step: 3, question: 'Identify weather and roll-over buffer.', status: 'critique' } },
      { kind: 'trace', event: { kind: 'research.step', step: 4, question: 'Finalise corporate shape.', status: 'refine' } },
      {
        kind: 'artifact',
        artifact: {
          kind: 'research_scratchpad',
          id: artifactId('research.cr'),
          title: 'Deep research · Wankhede Test',
          subtitle: 'Four sub-questions, weather-risk-first.',
          steps: [
            { id: 's1', question: 'Window?', status: 'refined', findings: `${ev?.window}.` },
            { id: 's2', question: 'Hospitality inventory?', status: 'refined', findings: 'Corporate Box at Garware End + Club House Pavilion; both hold 10.' },
            { id: 's3', question: 'Weather?', status: 'refined', findings: 'Late-Dec Mumbai carries residual humidity; a day-five roll-over is the standard buffer.' },
            { id: 's4', question: 'Briefing windows?', status: 'refined', findings: 'Saturday 09:30 and Sunday 10:15 both have former-captain availability.' },
          ],
        },
      },
      { kind: 'say', text: 'Inventory holds for a group of 10; a weather buffer exists and a briefing window is open.' },
    ]
  },
}

const logisticsPre: Beat = {
  id: 'l.cr.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /mumbai|cricket|wankhede|hotel/i),
  steps: () => [{ kind: 'toolCall', name: 'hotels_near_event', args: { city: CITY }, id: 'c.l.h' }],
}

const logisticsPost: Beat = {
  id: 'l.cr.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'hotels_near_event') && matchUser(input, /mumbai|cricket/i),
  steps: (input) => {
    const list = toolResult<Hotel[]>(input, 'hotels_near_event') ?? hotelsIn(CITY)
    const options = list.slice(0, 3).map((h, i) =>
      hotelCard(h, i === 0 ? 'corporate floors' : i === 2 ? 'meeting-friendly' : undefined),
    )
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('hotels.cr'),
          title: 'South Mumbai hotels · corporate group',
          subtitle: 'Sea-facing, close to Wankhede, set up for groups.',
          columns: 3,
          options,
          refinements: [
            chip('c.h.sea', 'Sea-facing rooms only'),
            chip('c.h.group', 'Prefer one hotel for the full group'),
            chip('c.h.compare', 'Compare these three'),
          ],
        },
      },
      { kind: 'say', text: 'The Taj is the quiet lobby on a Test evening; the Oberoi is calmer; Four Seasons pairs best with meetings.' },
    ]
  },
}

const experiencePre: Beat = {
  id: 'e.cr.pre',
  match: (input) => !isPostTool(input) && matchUser(input, /cricket|wankhede|hospitality|pavilion/i),
  steps: () => [{ kind: 'toolCall', name: 'tiers_for_event', args: { eventId: EVENT_ID }, id: 'c.e.t' }],
}

const experiencePost: Beat = {
  id: 'e.cr.post',
  match: (input) => isPostTool(input) && !!toolResult(input, 'tiers_for_event') && matchUser(input, /cricket|wankhede/i),
  steps: (input) => {
    const list = toolResult<HospitalityTier[]>(input, 'tiers_for_event') ?? hospitalityForEvent(EVENT_ID)
    const options = list.map((t, i) => tierCard(t, i === 0 ? 'keeps the group together' : undefined))
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'option_card_grid',
          id: artifactId('tiers.cr'),
          title: 'Hospitality · two shapes',
          subtitle: 'Corporate Box for one group; Club House Pavilion for more breathing room.',
          columns: 2,
          options,
          refinements: [chip('c.t.split', 'Split across both', 'accent'), chip('c.t.compare', 'Compare side-by-side')],
        },
      },
      { kind: 'say', text: 'Corporate Box keeps a 10-person group together; a split across both is the most generous option.' },
    ]
  },
}

const budgetBeat: Beat = {
  id: 'b.cr',
  match: (input) => matchUser(input, /cricket|wankhede|test/i),
  steps: () => {
    const tier = hospitalityForEvent(EVENT_ID)[0]!
    const hotel = hotelsIn(CITY)[0]!
    const lines = [
      { label: `${tier.name}, 10 × 2 days`, amount: scaleM(tier.perPerson, 20) },
      { label: `${hotel.name}, 2 nights × 5 rooms`, amount: scaleM(hotel.nightlyFrom, 10) },
      { label: 'Dinners, transfers, host', amount: { amount: 280_000, currency: 'INR' } as Money, tone: 'muted' as const },
    ]
    const total = sum(lines.map((l) => l.amount))
    return [
      {
        kind: 'artifact',
        artifact: {
          kind: 'pricing_breakdown',
          id: artifactId('b.cr'),
          title: 'Budget · corporate baseline',
          lines,
          total,
          note: 'A club-house shape saves ~₹8.8L and keeps the group together.',
        },
      },
      { kind: 'say', text: 'Inside most corporate caps for a group of 10.' },
    ]
  },
}

export const cricketScript: ScenarioScript = {
  name: 'cricket',
  beats: {
    Concierge: [insiderIntent, insiderPost, weather, dossier, intro, assemble],
    Researcher: [researchPre, researchPost],
    Logistics: [logisticsPre, logisticsPost],
    Experience: [experiencePre, experiencePost],
    Budget: [budgetBeat],
    Personalizer: [],
  },
}
