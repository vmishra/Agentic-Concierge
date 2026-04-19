import type { Money } from '@/adk/a2ui'

export interface Hotel {
  id: string
  name: string
  city: string
  tier: 'five-star' | 'boutique' | 'palace'
  distanceToVenueKm: number
  nightlyFrom: Money
  amenities: string[]
  notes: string
  accessibility: boolean
  lat: number
  lng: number
}

export const hotels: Hotel[] = [
  // Abu Dhabi — for Yas Marina Circuit
  {
    id: 'ad-waldorf',
    name: 'Waldorf Astoria — Yas Marina',
    city: 'Abu Dhabi',
    tier: 'five-star',
    distanceToVenueKm: 0.4,
    nightlyFrom: { amount: 95_000, currency: 'INR' },
    amenities: ['marina view', 'step-free rooms', 'private dining', 'airport transfer'],
    notes: 'Five-minute walk to the south paddock gate.',
    accessibility: true,
    lat: 24.4672,
    lng: 54.6036,
  },
  {
    id: 'ad-ritz',
    name: 'The Ritz-Carlton — Grand Canal',
    city: 'Abu Dhabi',
    tier: 'five-star',
    distanceToVenueKm: 12.1,
    nightlyFrom: { amount: 78_000, currency: 'INR' },
    amenities: ['canal setting', 'spa', 'kids club', 'step-free rooms'],
    notes: 'Quieter atmosphere away from the circuit — good for the mornings after.',
    accessibility: true,
    lat: 24.4032,
    lng: 54.4897,
  },
  {
    id: 'ad-emirates-palace',
    name: 'Emirates Palace',
    city: 'Abu Dhabi',
    tier: 'palace',
    distanceToVenueKm: 25.8,
    nightlyFrom: { amount: 168_000, currency: 'INR' },
    amenities: ['butler service', 'private beach', 'full accessibility suite'],
    notes: 'Ceremonial scale. Ideal when the trip is about the landing, not just the race.',
    accessibility: true,
    lat: 24.4617,
    lng: 54.3172,
  },
  // London — for Wimbledon
  {
    id: 'ld-connaught',
    name: 'The Connaught',
    city: 'London',
    tier: 'five-star',
    distanceToVenueKm: 14.2,
    nightlyFrom: { amount: 118_000, currency: 'INR' },
    amenities: ['Mayfair', 'family suites', 'step-free rooms', 'Michelin dining'],
    notes: 'Quietly the best-run hotel in Mayfair; kind to families with younger children.',
    accessibility: true,
    lat: 51.5104,
    lng: -0.1494,
  },
  {
    id: 'ld-hotel-du-vin',
    name: 'Hotel du Vin — Cannizaro House',
    city: 'London',
    tier: 'boutique',
    distanceToVenueKm: 1.8,
    nightlyFrom: { amount: 58_000, currency: 'INR' },
    amenities: ['parkside', 'garden suites', 'on the common'],
    notes: 'Walk to the queue on finals day — a real Wimbledon village stay.',
    accessibility: true,
    lat: 51.4281,
    lng: -0.2374,
  },
  {
    id: 'ld-rosewood',
    name: 'Rosewood London',
    city: 'London',
    tier: 'five-star',
    distanceToVenueKm: 18.4,
    nightlyFrom: { amount: 92_000, currency: 'INR' },
    amenities: ['Holborn', 'manor house setting', 'kids concierge'],
    notes: 'Central without being central — good for theatre and museum days.',
    accessibility: true,
    lat: 51.5174,
    lng: -0.119,
  },
  // Mumbai — for Wankhede
  {
    id: 'mb-taj',
    name: 'The Taj Mahal Palace',
    city: 'Mumbai',
    tier: 'palace',
    distanceToVenueKm: 2.1,
    nightlyFrom: { amount: 54_000, currency: 'INR' },
    amenities: ['sea view', 'heritage wing', 'corporate floors', 'step-free suites'],
    notes: 'A corporate group returns from Wankhede to the Sea Lounge in fifteen minutes.',
    accessibility: true,
    lat: 18.9217,
    lng: 72.8332,
  },
  {
    id: 'mb-oberoi',
    name: 'The Oberoi Mumbai',
    city: 'Mumbai',
    tier: 'five-star',
    distanceToVenueKm: 1.5,
    nightlyFrom: { amount: 46_000, currency: 'INR' },
    amenities: ['Marine Drive', 'executive floors', 'in-room dining 24h'],
    notes: 'Perhaps the calmest lobby in South Mumbai on a test-match evening.',
    accessibility: true,
    lat: 18.9253,
    lng: 72.8232,
  },
  {
    id: 'mb-four-seasons',
    name: 'Four Seasons Mumbai',
    city: 'Mumbai',
    tier: 'five-star',
    distanceToVenueKm: 4.5,
    nightlyFrom: { amount: 48_000, currency: 'INR' },
    amenities: ['rooftop lounge', 'executive floors', 'meeting spaces'],
    notes: 'A practical base when the plan doubles as a business trip.',
    accessibility: true,
    lat: 18.9952,
    lng: 72.8138,
  },
]

export function hotelsIn(city: string) {
  return hotels.filter((h) => h.city === city)
}
