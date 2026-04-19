/**
 * Hospitality tiers — the real axis of difference in experiential travel.
 * Copy is understated and specific. Never "VIP experience"; always a noun.
 */

import type { Money } from '@/adk/a2ui'

export interface HospitalityTier {
  id: string
  eventId: string
  name: string
  tier: 'grandstand' | 'suite' | 'paddock' | 'debenture' | 'pavilion' | 'hospitality-suite'
  perPerson: Money
  includes: string[]
  access: string[]
  insider?: string
  group?: { min: number; max: number }
}

export const hospitality: HospitalityTier[] = [
  // Abu Dhabi
  {
    id: 'ad-grandstand-north',
    eventId: 'f1-abu-dhabi-25',
    name: 'North Grandstand · Turn 5',
    tier: 'grandstand',
    perPerson: { amount: 185_000, currency: 'INR' },
    includes: ['reserved seating all three days', 'in-seat refreshments', 'race programme'],
    access: ['grandstand only', 'paddock walk on Thursday'],
  },
  {
    id: 'ad-f1-experience-trophy',
    eventId: 'f1-abu-dhabi-25',
    name: 'F1 Experiences · Trophy',
    tier: 'hospitality-suite',
    perPerson: { amount: 425_000, currency: 'INR' },
    includes: ['covered hospitality lounge', 'chef-led menu', 'open bar', 'driver Q&A session'],
    access: ['pit lane walk on Thursday', 'grid tour on Sunday'],
    insider: 'Driver Q&A is livelier mid-week; request Friday for the championship-standing briefing.',
  },
  {
    id: 'ad-paddock-club',
    eventId: 'f1-abu-dhabi-25',
    name: 'Paddock Club · Formula 1',
    tier: 'paddock',
    perPerson: { amount: 790_000, currency: 'INR' },
    includes: ['paddock-level hospitality', 'trackside terrace', 'Champagne service'],
    access: ['full paddock access', 'pit-lane walk daily', 'team-garage viewing windows'],
    insider: 'Team garage windows rotate — ask for the opposite side of Turn 1 for a quieter vantage.',
    group: { min: 2, max: 12 },
  },
  // Wimbledon
  {
    id: 'wim-court-1',
    eventId: 'wimbledon-26',
    name: 'No.1 Court · Hospitality',
    tier: 'hospitality-suite',
    perPerson: { amount: 220_000, currency: 'INR' },
    includes: ['lunch and tea at the pavilion', 'reserved No.1 Court seats'],
    access: ['all outer courts', 'No.1 Court seat'],
  },
  {
    id: 'wim-centre-debenture',
    eventId: 'wimbledon-26',
    name: 'Centre Court · Debenture',
    tier: 'debenture',
    perPerson: { amount: 680_000, currency: 'INR' },
    includes: ['debenture lounge access', 'three-course lunch', 'Centre Court seats'],
    access: ['Centre and No.1 Courts', 'debenture members lounge'],
    insider: 'Debenture lounges quiet down during the middle Saturday — a good window to bring younger guests.',
  },
  {
    id: 'wim-middle-sunday-pavilion',
    eventId: 'wimbledon-26',
    name: 'Middle Sunday Pavilion',
    tier: 'pavilion',
    perPerson: { amount: 185_000, currency: 'INR' },
    includes: ['grounds access', 'strawberries tea', 'pavilion pass'],
    access: ['grounds pass', 'pavilion only'],
  },
  // Cricket
  {
    id: 'wankhede-corporate-box',
    eventId: 'ind-aus-test-26',
    name: 'Corporate Box · Garware End',
    tier: 'hospitality-suite',
    perPerson: { amount: 92_000, currency: 'INR' },
    includes: ['private box for up to 12', 'chef-led menu', 'two-day hospitality'],
    access: ['box seating', 'corporate lounge', 'dedicated host'],
    group: { min: 6, max: 12 },
  },
  {
    id: 'wankhede-club-house',
    eventId: 'ind-aus-test-26',
    name: 'Club House Pavilion',
    tier: 'pavilion',
    perPerson: { amount: 48_000, currency: 'INR' },
    includes: ['all-day access', 'club-house lunch', 'memorabilia programme'],
    access: ['pavilion seating', 'members-side walkways'],
  },
]

export function hospitalityForEvent(eventId: string) {
  return hospitality.filter((h) => h.eventId === eventId)
}
