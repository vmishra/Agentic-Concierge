import type { Money } from '@/adk/a2ui'

export interface Flight {
  id: string
  carrier: string
  from: string
  to: string
  depart: string
  arrive: string
  durationHours: number
  priceFrom: Money
  cabin: 'Economy' | 'Premium' | 'Business' | 'First'
}

export const flights: Flight[] = [
  {
    id: 'ek-508-bom-auh',
    carrier: 'Emirates',
    from: 'BOM',
    to: 'AUH',
    depart: '21:50',
    arrive: '23:05',
    durationHours: 3.2,
    priceFrom: { amount: 72_000, currency: 'INR' },
    cabin: 'Business',
  },
  {
    id: 'ey-205-del-auh',
    carrier: 'Etihad',
    from: 'DEL',
    to: 'AUH',
    depart: '04:15',
    arrive: '06:45',
    durationHours: 4.0,
    priceFrom: { amount: 64_000, currency: 'INR' },
    cabin: 'Business',
  },
  {
    id: 'ba-138-bom-lhr',
    carrier: 'British Airways',
    from: 'BOM',
    to: 'LHR',
    depart: '13:45',
    arrive: '18:55',
    durationHours: 9.8,
    priceFrom: { amount: 235_000, currency: 'INR' },
    cabin: 'Business',
  },
  {
    id: 'vs-302-del-lhr',
    carrier: 'Virgin Atlantic',
    from: 'DEL',
    to: 'LHR',
    depart: '14:20',
    arrive: '19:30',
    durationHours: 9.5,
    priceFrom: { amount: 245_000, currency: 'INR' },
    cabin: 'Business',
  },
]
