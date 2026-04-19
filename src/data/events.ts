/**
 * Event catalog — a curated inventory of marquee experiences. Deliberately
 * understated copy; the concierge voice is "arrange" and "curate", never "book".
 */

export interface EventItem {
  id: string
  name: string
  sport: 'Formula 1' | 'Tennis' | 'Cricket' | 'Football' | 'Golf' | 'Music'
  city: string
  country: string
  venue: string
  window: string
  tags: string[]
  summary: string
}

export const events: EventItem[] = [
  {
    id: 'f1-abu-dhabi-25',
    name: 'Abu Dhabi Grand Prix',
    sport: 'Formula 1',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    venue: 'Yas Marina Circuit',
    window: '28–30 November 2025',
    tags: ['season finale', 'twilight race', 'marina setting', 'paddock friendly'],
    summary:
      'The closing round of the championship under the marina floodlights. A natural bookend for a gifting weekend.',
  },
  {
    id: 'f1-silverstone-26',
    name: 'British Grand Prix',
    sport: 'Formula 1',
    city: 'Silverstone',
    country: 'United Kingdom',
    venue: 'Silverstone Circuit',
    window: '3–5 July 2026',
    tags: ['historic circuit', 'paddock club', 'grandstand variety'],
    summary:
      'The fastest, most atmospheric British crowd of the season, with a hospitality pavilion inside Turn 3.',
  },
  {
    id: 'f1-monza-26',
    name: 'Italian Grand Prix',
    sport: 'Formula 1',
    city: 'Monza',
    country: 'Italy',
    venue: 'Autodromo Nazionale di Monza',
    window: '4–6 September 2026',
    tags: ['temple of speed', 'tifosi', 'long lunches'],
    summary: 'The temple of speed — approachable, flavourful, and the loudest grandstands on the calendar.',
  },
  {
    id: 'wimbledon-26',
    name: 'The Championships, Wimbledon',
    sport: 'Tennis',
    city: 'London',
    country: 'United Kingdom',
    venue: 'All England Lawn Tennis Club',
    window: '29 June – 12 July 2026',
    tags: ['centre court', 'debenture', 'dress code', 'strawberries'],
    summary: 'Two weeks of grass-court tennis, with Centre Court debenture seats and a tasteful members-pavilion lunch.',
  },
  {
    id: 'ind-aus-test-26',
    name: 'India v Australia — Border-Gavaskar Test',
    sport: 'Cricket',
    city: 'Mumbai',
    country: 'India',
    venue: 'Wankhede Stadium',
    window: '12–16 December 2026',
    tags: ['day test', 'hospitality suites', 'corporate friendly'],
    summary: 'Five days of Test cricket in Mumbai — ideal for a corporate group with a domestic schedule.',
  },
  {
    id: 'rwc-final-27',
    name: 'Rugby World Cup Final',
    sport: 'Football',
    city: 'Sydney',
    country: 'Australia',
    venue: 'Stadium Australia',
    window: '27 November 2027',
    tags: ['single match', 'premium hospitality'],
    summary: 'One evening, one stadium, a whole continent watching.',
  },
  {
    id: 'masters-26',
    name: 'The Masters',
    sport: 'Golf',
    city: 'Augusta',
    country: 'United States',
    venue: 'Augusta National',
    window: '9–12 April 2026',
    tags: ['patron badges', 'no phones', 'azaleas'],
    summary: 'A patron-badge tradition with a hospitality chalet and a steady week of quiet.',
  },
]

export function findEvent(id: string) {
  return events.find((e) => e.id === id)
}

export function searchEvents(query: string): EventItem[] {
  const q = query.toLowerCase()
  return events.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.sport.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.tags.some((t) => t.includes(q)),
  )
}
