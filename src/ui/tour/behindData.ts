/**
 * Mocked planning data for the Behind-the-Scenes command centre.
 *
 * Realistic but fabricated — event windows, demand signals, social velocity,
 * revenue ratios, persona splits. Used for the static pre-agent planning
 * dashboard that demonstrates how a concierge team would source and
 * prioritise events before they ever reach a guest.
 */

export type Category = 'F1' | 'Tennis' | 'Cricket' | 'Football' | 'Golf' | 'Rugby' | 'Live'
export type Action = 'Push' | 'Hold' | 'Monitor' | 'Skip'
export type Persona = 'UHNI' | 'HNI' | 'Corporate' | 'Family' | 'Mixed'

export interface EventRow {
  id: string
  name: string
  category: Category
  league: string
  city: string
  country: string
  start: string // YYYY-MM-DD
  end?: string
  month: number // 1..12
  /** Demand score 0-100 (composite) */
  demand: number
  /** Week-over-week social velocity, +/- % */
  socialVelocity: number
  /** Last 30d news mentions */
  newsMentions: number
  /** Search trend index 0-100 */
  searchTrend: number
  /** Booking inquiry velocity: daily inquiries over last 14d */
  inquiryVelocity: number
  /** Revenue potential for the company, INR */
  revenuePotential: number
  /** Average order value per guest, INR */
  aov: number
  /** % of tickets bundled with hospitality */
  attachRate: number
  /** Gross margin % */
  margin: number
  /** Primary persona */
  persona: Persona
  /** Persona mix (%) — sums to 100 */
  personaMix: Partial<Record<Persona, number>>
  /** Inventory: seats held / seats remaining */
  inventoryHeld: number
  inventoryRemaining: number
  /** Recommended action */
  action: Action
  /** Short rationale */
  rationale: string
  /** 12-week demand curve, 0-100 */
  curve: number[]
  /** Signal breakdown */
  signals: { label: string; strength: number }[]
}

// -----------------------------------------------------------------------------
// 2026 event catalogue — marquee across the categories a concierge tracks.
// -----------------------------------------------------------------------------
export const events2026: EventRow[] = [
  {
    id: 'ausopen-26', name: 'Australian Open', category: 'Tennis', league: 'Grand Slam',
    city: 'Melbourne', country: 'Australia', start: '2026-01-19', end: '2026-02-01', month: 1,
    demand: 78, socialVelocity: 14, newsMentions: 1320, searchTrend: 72, inquiryVelocity: 18,
    revenuePotential: 18_500_000, aov: 420_000, attachRate: 64, margin: 28,
    persona: 'HNI', personaMix: { HNI: 40, Corporate: 28, UHNI: 18, Family: 14 },
    inventoryHeld: 48, inventoryRemaining: 16, action: 'Push',
    rationale: 'Fortnight, strong UHNI demand, hospitality attach high.',
    curve: [32, 38, 44, 48, 54, 62, 68, 74, 80, 82, 85, 88],
    signals: [{ label: 'social', strength: 62 }, { label: 'news', strength: 54 }, { label: 'search', strength: 72 }, { label: 'inquiry', strength: 70 }, { label: 'competitor', strength: -8 }],
  },
  {
    id: 'sixn-final-26', name: 'Six Nations · Final Weekend', category: 'Rugby', league: 'Six Nations',
    city: 'Paris', country: 'France', start: '2026-03-14', month: 3,
    demand: 64, socialVelocity: 8, newsMentions: 780, searchTrend: 58, inquiryVelocity: 9,
    revenuePotential: 7_200_000, aov: 310_000, attachRate: 52, margin: 31,
    persona: 'Corporate', personaMix: { Corporate: 52, HNI: 24, UHNI: 14, Family: 10 },
    inventoryHeld: 22, inventoryRemaining: 9, action: 'Hold',
    rationale: 'Europe-heavy demand; India buyers need F&B angle.',
    curve: [22, 26, 30, 34, 40, 46, 50, 54, 58, 60, 62, 64],
    signals: [{ label: 'social', strength: 34 }, { label: 'news', strength: 42 }, { label: 'search', strength: 58 }, { label: 'inquiry', strength: 38 }, { label: 'competitor', strength: 6 }],
  },
  {
    id: 'masters-26', name: 'The Masters', category: 'Golf', league: 'Augusta National',
    city: 'Augusta', country: 'United States', start: '2026-04-09', end: '2026-04-12', month: 4,
    demand: 88, socialVelocity: 22, newsMentions: 2140, searchTrend: 84, inquiryVelocity: 28,
    revenuePotential: 28_400_000, aov: 780_000, attachRate: 76, margin: 36,
    persona: 'UHNI', personaMix: { UHNI: 48, HNI: 28, Corporate: 18, Family: 6 },
    inventoryHeld: 18, inventoryRemaining: 3, action: 'Push',
    rationale: 'Inventory scarce; patron badges re-sell at premium.',
    curve: [48, 55, 60, 66, 72, 78, 82, 86, 88, 89, 90, 92],
    signals: [{ label: 'social', strength: 78 }, { label: 'news', strength: 82 }, { label: 'search', strength: 84 }, { label: 'inquiry', strength: 88 }, { label: 'competitor', strength: -18 }],
  },
  {
    id: 'monaco-gp-26', name: 'Monaco Grand Prix', category: 'F1', league: 'Formula 1',
    city: 'Monte Carlo', country: 'Monaco', start: '2026-05-22', end: '2026-05-24', month: 5,
    demand: 92, socialVelocity: 28, newsMentions: 3200, searchTrend: 92, inquiryVelocity: 42,
    revenuePotential: 42_600_000, aov: 1_240_000, attachRate: 82, margin: 38,
    persona: 'UHNI', personaMix: { UHNI: 58, HNI: 22, Corporate: 16, Family: 4 },
    inventoryHeld: 14, inventoryRemaining: 2, action: 'Push',
    rationale: 'Paddock + yacht packages saturating; raise price.',
    curve: [60, 66, 72, 78, 82, 86, 88, 90, 91, 92, 93, 94],
    signals: [{ label: 'social', strength: 86 }, { label: 'news', strength: 88 }, { label: 'search', strength: 92 }, { label: 'inquiry', strength: 94 }, { label: 'competitor', strength: -24 }],
  },
  {
    id: 'french-open-26', name: 'Roland-Garros', category: 'Tennis', league: 'Grand Slam',
    city: 'Paris', country: 'France', start: '2026-05-24', end: '2026-06-07', month: 5,
    demand: 74, socialVelocity: 12, newsMentions: 1420, searchTrend: 70, inquiryVelocity: 16,
    revenuePotential: 16_800_000, aov: 390_000, attachRate: 60, margin: 29,
    persona: 'HNI', personaMix: { HNI: 42, Corporate: 26, UHNI: 20, Family: 12 },
    inventoryHeld: 36, inventoryRemaining: 14, action: 'Push',
    rationale: 'Second-week inventory still fluid.',
    curve: [28, 34, 40, 46, 52, 58, 62, 66, 70, 72, 74, 76],
    signals: [{ label: 'social', strength: 58 }, { label: 'news', strength: 60 }, { label: 'search', strength: 70 }, { label: 'inquiry', strength: 64 }, { label: 'competitor', strength: -4 }],
  },
  {
    id: 'champ-league-final-26', name: 'UEFA Champions League Final', category: 'Football', league: 'UEFA',
    city: 'Munich', country: 'Germany', start: '2026-05-30', month: 5,
    demand: 86, socialVelocity: 34, newsMentions: 4100, searchTrend: 94, inquiryVelocity: 38,
    revenuePotential: 22_800_000, aov: 520_000, attachRate: 58, margin: 26,
    persona: 'Corporate', personaMix: { Corporate: 46, HNI: 26, UHNI: 18, Family: 10 },
    inventoryHeld: 24, inventoryRemaining: 6, action: 'Push',
    rationale: 'Finalist teams drop 3 weeks out — hold 40% of supply.',
    curve: [40, 46, 52, 58, 66, 72, 78, 82, 84, 86, 86, 90],
    signals: [{ label: 'social', strength: 82 }, { label: 'news', strength: 88 }, { label: 'search', strength: 94 }, { label: 'inquiry', strength: 84 }, { label: 'competitor', strength: -10 }],
  },
  {
    id: 'wimbledon-26', name: 'The Championships · Wimbledon', category: 'Tennis', league: 'Grand Slam',
    city: 'London', country: 'United Kingdom', start: '2026-06-29', end: '2026-07-12', month: 6,
    demand: 94, socialVelocity: 26, newsMentions: 3800, searchTrend: 96, inquiryVelocity: 46,
    revenuePotential: 46_200_000, aov: 820_000, attachRate: 78, margin: 34,
    persona: 'UHNI', personaMix: { UHNI: 44, HNI: 30, Corporate: 16, Family: 10 },
    inventoryHeld: 52, inventoryRemaining: 9, action: 'Push',
    rationale: 'Centre Court debenture resale pricing up 18% YoY.',
    curve: [52, 58, 64, 70, 76, 82, 86, 90, 92, 94, 95, 96],
    signals: [{ label: 'social', strength: 88 }, { label: 'news', strength: 90 }, { label: 'search', strength: 96 }, { label: 'inquiry', strength: 94 }, { label: 'competitor', strength: -22 }],
  },
  {
    id: 'the-open-26', name: 'The Open Championship', category: 'Golf', league: 'R&A',
    city: 'St Andrews', country: 'United Kingdom', start: '2026-07-16', end: '2026-07-19', month: 7,
    demand: 72, socialVelocity: 18, newsMentions: 1480, searchTrend: 74, inquiryVelocity: 14,
    revenuePotential: 14_200_000, aov: 560_000, attachRate: 64, margin: 32,
    persona: 'HNI', personaMix: { HNI: 38, UHNI: 30, Corporate: 22, Family: 10 },
    inventoryHeld: 28, inventoryRemaining: 12, action: 'Hold',
    rationale: 'St Andrews rotation draws HNI globally.',
    curve: [30, 36, 42, 48, 54, 60, 64, 68, 70, 72, 73, 74],
    signals: [{ label: 'social', strength: 60 }, { label: 'news', strength: 64 }, { label: 'search', strength: 74 }, { label: 'inquiry', strength: 56 }, { label: 'competitor', strength: 4 }],
  },
  {
    id: 'coldplay-mumbai-26', name: 'Coldplay · Music of the Spheres', category: 'Live', league: 'World Tour',
    city: 'Mumbai', country: 'India', start: '2026-08-12', end: '2026-08-14', month: 8,
    demand: 96, socialVelocity: 52, newsMentions: 5600, searchTrend: 100, inquiryVelocity: 68,
    revenuePotential: 21_400_000, aov: 180_000, attachRate: 42, margin: 24,
    persona: 'Family', personaMix: { Family: 38, HNI: 28, Corporate: 18, UHNI: 16 },
    inventoryHeld: 84, inventoryRemaining: 4, action: 'Push',
    rationale: 'Tour extension likely; concierge hospitality premium intact.',
    curve: [68, 74, 82, 88, 92, 94, 95, 96, 97, 97, 98, 98],
    signals: [{ label: 'social', strength: 98 }, { label: 'news', strength: 88 }, { label: 'search', strength: 100 }, { label: 'inquiry', strength: 96 }, { label: 'competitor', strength: -32 }],
  },
  {
    id: 'us-open-26', name: 'US Open', category: 'Tennis', league: 'Grand Slam',
    city: 'New York', country: 'United States', start: '2026-08-31', end: '2026-09-13', month: 8,
    demand: 82, socialVelocity: 16, newsMentions: 2240, searchTrend: 84, inquiryVelocity: 24,
    revenuePotential: 22_600_000, aov: 480_000, attachRate: 68, margin: 30,
    persona: 'HNI', personaMix: { HNI: 38, Corporate: 30, UHNI: 20, Family: 12 },
    inventoryHeld: 42, inventoryRemaining: 12, action: 'Push',
    rationale: 'Arthur Ashe premium holds; corporate box demand strong.',
    curve: [38, 44, 50, 56, 62, 68, 74, 78, 80, 82, 84, 86],
    signals: [{ label: 'social', strength: 70 }, { label: 'news', strength: 74 }, { label: 'search', strength: 84 }, { label: 'inquiry', strength: 72 }, { label: 'competitor', strength: -6 }],
  },
  {
    id: 'monza-gp-26', name: 'Italian Grand Prix', category: 'F1', league: 'Formula 1',
    city: 'Monza', country: 'Italy', start: '2026-09-04', end: '2026-09-06', month: 9,
    demand: 80, socialVelocity: 20, newsMentions: 1980, searchTrend: 82, inquiryVelocity: 26,
    revenuePotential: 19_200_000, aov: 640_000, attachRate: 72, margin: 33,
    persona: 'HNI', personaMix: { HNI: 44, Corporate: 26, UHNI: 20, Family: 10 },
    inventoryHeld: 30, inventoryRemaining: 8, action: 'Push',
    rationale: 'Tifosi spike when Ferrari quali top-three.',
    curve: [36, 44, 50, 58, 64, 70, 74, 76, 78, 80, 81, 82],
    signals: [{ label: 'social', strength: 72 }, { label: 'news', strength: 68 }, { label: 'search', strength: 82 }, { label: 'inquiry', strength: 74 }, { label: 'competitor', strength: -8 }],
  },
  {
    id: 'ipl-final-26', name: 'IPL Final', category: 'Cricket', league: 'Indian Premier League',
    city: 'Ahmedabad', country: 'India', start: '2026-05-24', month: 5,
    demand: 88, socialVelocity: 42, newsMentions: 6800, searchTrend: 100, inquiryVelocity: 52,
    revenuePotential: 18_800_000, aov: 210_000, attachRate: 48, margin: 22,
    persona: 'Corporate', personaMix: { Corporate: 48, HNI: 26, Family: 16, UHNI: 10 },
    inventoryHeld: 60, inventoryRemaining: 11, action: 'Push',
    rationale: 'Narendra Modi stadium — corporate box flow strong.',
    curve: [44, 52, 60, 68, 74, 80, 84, 86, 88, 88, 89, 90],
    signals: [{ label: 'social', strength: 90 }, { label: 'news', strength: 94 }, { label: 'search', strength: 100 }, { label: 'inquiry', strength: 88 }, { label: 'competitor', strength: -14 }],
  },
  {
    id: 'ind-aus-test-26', name: 'India v Australia · Border-Gavaskar Test', category: 'Cricket', league: 'Test Cricket',
    city: 'Mumbai', country: 'India', start: '2026-12-12', end: '2026-12-16', month: 12,
    demand: 78, socialVelocity: 24, newsMentions: 2840, searchTrend: 86, inquiryVelocity: 22,
    revenuePotential: 12_400_000, aov: 260_000, attachRate: 58, margin: 26,
    persona: 'Corporate', personaMix: { Corporate: 54, HNI: 24, Family: 14, UHNI: 8 },
    inventoryHeld: 44, inventoryRemaining: 16, action: 'Hold',
    rationale: 'Format-specific; day-1 and day-5 pricing differ by 2.4x.',
    curve: [30, 36, 42, 48, 54, 60, 66, 70, 74, 76, 78, 80],
    signals: [{ label: 'social', strength: 74 }, { label: 'news', strength: 80 }, { label: 'search', strength: 86 }, { label: 'inquiry', strength: 68 }, { label: 'competitor', strength: 0 }],
  },
  {
    id: 'abu-dhabi-gp-26', name: 'Abu Dhabi Grand Prix', category: 'F1', league: 'Formula 1',
    city: 'Abu Dhabi', country: 'UAE', start: '2026-11-27', end: '2026-11-29', month: 11,
    demand: 90, socialVelocity: 30, newsMentions: 2560, searchTrend: 88, inquiryVelocity: 36,
    revenuePotential: 32_800_000, aov: 980_000, attachRate: 80, margin: 35,
    persona: 'UHNI', personaMix: { UHNI: 46, HNI: 28, Corporate: 20, Family: 6 },
    inventoryHeld: 38, inventoryRemaining: 9, action: 'Push',
    rationale: 'Championship finale; paddock club 92% sold.',
    curve: [42, 50, 58, 66, 72, 78, 82, 86, 88, 90, 91, 92],
    signals: [{ label: 'social', strength: 80 }, { label: 'news', strength: 78 }, { label: 'search', strength: 88 }, { label: 'inquiry', strength: 86 }, { label: 'competitor', strength: -12 }],
  },
  {
    id: 'taylor-swift-sing-26', name: 'Taylor Swift · The Eras (Asia Leg)', category: 'Live', league: 'World Tour',
    city: 'Singapore', country: 'Singapore', start: '2026-10-16', end: '2026-10-18', month: 10,
    demand: 98, socialVelocity: 64, newsMentions: 9200, searchTrend: 100, inquiryVelocity: 88,
    revenuePotential: 28_600_000, aov: 220_000, attachRate: 52, margin: 28,
    persona: 'Mixed', personaMix: { Family: 34, HNI: 28, Corporate: 20, UHNI: 18 },
    inventoryHeld: 120, inventoryRemaining: 3, action: 'Push',
    rationale: 'Demand exceeds supply ~40x; hospitality bundles premium.',
    curve: [82, 86, 90, 92, 94, 96, 97, 98, 98, 99, 99, 99],
    signals: [{ label: 'social', strength: 100 }, { label: 'news', strength: 96 }, { label: 'search', strength: 100 }, { label: 'inquiry', strength: 100 }, { label: 'competitor', strength: -40 }],
  },
]

// -----------------------------------------------------------------------------
// Weekend heat — 52 weeks of 2026 demand index
// -----------------------------------------------------------------------------
export function weekendHeat(): { week: number; month: number; intensity: number; note?: string }[] {
  // Manually-weighted: marquee weeks pop above 70.
  const base: Record<number, number> = {
    3: 82, 4: 76, 7: 48, 9: 62, 14: 94, 18: 72, 21: 96, 22: 98, 26: 98, 27: 99, 28: 96, 29: 74,
    30: 64, 33: 98, 35: 88, 36: 92, 37: 84, 42: 100, 47: 96, 48: 92, 50: 84,
  }
  const notes: Record<number, string> = {
    14: 'Masters',
    21: 'Monaco GP',
    22: 'CL Final + IPL Final',
    26: 'Wimbledon wk 1',
    27: 'Wimbledon wk 2',
    33: 'Coldplay Mumbai',
    36: 'Monza GP',
    42: 'Taylor Swift Asia',
    47: 'Abu Dhabi GP',
    50: 'Border-Gavaskar Test',
  }
  return Array.from({ length: 52 }, (_, i) => {
    const wk = i + 1
    const month = Math.min(12, Math.ceil(wk / 4.33))
    const intensity = base[wk] ?? 20 + Math.round(Math.abs(Math.sin(wk * 0.9)) * 28)
    return { week: wk, month, intensity, note: notes[wk] }
  })
}

// -----------------------------------------------------------------------------
// Weather snapshots for major venue cities (mocked)
// -----------------------------------------------------------------------------
export interface WeatherCell {
  city: string
  month: number
  hiC: number
  loC: number
  rainDays: number
  note: string
}
export const weatherSnapshots: WeatherCell[] = [
  { city: 'London', month: 6, hiC: 22, loC: 13, rainDays: 7, note: 'Soft evenings; queue-friendly' },
  { city: 'London', month: 7, hiC: 24, loC: 15, rainDays: 6, note: 'Warmest of the fortnight' },
  { city: 'Melbourne', month: 1, hiC: 28, loC: 17, rainDays: 4, note: 'Hot afternoons; retractable roof' },
  { city: 'Paris', month: 5, hiC: 20, loC: 11, rainDays: 9, note: 'Rain-interruption risk' },
  { city: 'Mumbai', month: 8, hiC: 30, loC: 25, rainDays: 18, note: 'Monsoon active; hospitality indoors' },
  { city: 'Mumbai', month: 12, hiC: 31, loC: 19, rainDays: 0, note: 'Crisp, dry; peak travel season' },
  { city: 'Monte Carlo', month: 5, hiC: 22, loC: 15, rainDays: 5, note: 'Ideal yacht weather' },
  { city: 'Augusta', month: 4, hiC: 24, loC: 11, rainDays: 6, note: 'Azaleas in bloom' },
  { city: 'Abu Dhabi', month: 11, hiC: 29, loC: 19, rainDays: 1, note: 'Perfect outdoor conditions' },
  { city: 'St Andrews', month: 7, hiC: 18, loC: 11, rainDays: 8, note: 'Links wind factor' },
  { city: 'Monza', month: 9, hiC: 25, loC: 14, rainDays: 5, note: 'Storm risk Sunday' },
  { city: 'New York', month: 9, hiC: 27, loC: 18, rainDays: 7, note: 'Late-summer humidity' },
  { city: 'Munich', month: 5, hiC: 20, loC: 9, rainDays: 10, note: 'Variable; pack layers' },
  { city: 'Singapore', month: 10, hiC: 31, loC: 25, rainDays: 13, note: 'Evening thunderstorms typical' },
]

// -----------------------------------------------------------------------------
// Holiday calendar across major markets
// -----------------------------------------------------------------------------
export interface Holiday {
  date: string // YYYY-MM-DD
  market: 'IN' | 'UK' | 'US' | 'AE' | 'EU'
  name: string
  travelDemand: 'very-high' | 'high' | 'medium' | 'low'
}
export const holidays2026: Holiday[] = [
  { date: '2026-01-26', market: 'IN', name: 'Republic Day', travelDemand: 'medium' },
  { date: '2026-03-06', market: 'IN', name: 'Holi', travelDemand: 'high' },
  { date: '2026-04-03', market: 'UK', name: 'Good Friday', travelDemand: 'high' },
  { date: '2026-05-04', market: 'UK', name: 'Early May Bank Holiday', travelDemand: 'high' },
  { date: '2026-05-25', market: 'UK', name: 'Spring Bank Holiday', travelDemand: 'very-high' },
  { date: '2026-07-04', market: 'US', name: 'Independence Day', travelDemand: 'very-high' },
  { date: '2026-08-15', market: 'IN', name: 'Independence Day', travelDemand: 'high' },
  { date: '2026-08-31', market: 'UK', name: 'Summer Bank Holiday', travelDemand: 'very-high' },
  { date: '2026-10-02', market: 'IN', name: 'Gandhi Jayanti', travelDemand: 'high' },
  { date: '2026-10-20', market: 'IN', name: 'Diwali', travelDemand: 'very-high' },
  { date: '2026-11-26', market: 'US', name: 'Thanksgiving', travelDemand: 'very-high' },
  { date: '2026-12-02', market: 'AE', name: 'UAE National Day', travelDemand: 'high' },
  { date: '2026-12-25', market: 'UK', name: 'Christmas', travelDemand: 'very-high' },
]

// -----------------------------------------------------------------------------
// Clubbing opportunities — events that can be bundled into one trip
// -----------------------------------------------------------------------------
export interface Clubbing {
  name: string
  events: string[] // event ids
  window: string
  rationale: string
  liftPct: number // revenue lift %
}
export const clubbingOpportunities: Clubbing[] = [
  {
    name: 'Wimbledon + The Open',
    events: ['wimbledon-26', 'the-open-26'],
    window: '29 Jun – 19 Jul 2026',
    rationale: 'Tennis fortnight then flight to Scotland for the golf. Premium London stay threads both.',
    liftPct: 28,
  },
  {
    name: 'Monaco + Champions League Final',
    events: ['monaco-gp-26', 'champ-league-final-26'],
    window: '22 May – 30 May 2026',
    rationale: 'Monaco on the Sunday, train to Munich for the Saturday final. Back-to-back premium.',
    liftPct: 34,
  },
  {
    name: 'IPL Final + Monaco Grand Prix',
    events: ['ipl-final-26', 'monaco-gp-26'],
    window: '24 May – 24 May 2026',
    rationale: 'Same weekend, different continents — split a corporate group.',
    liftPct: 12,
  },
  {
    name: 'Abu Dhabi GP + Border-Gavaskar',
    events: ['abu-dhabi-gp-26', 'ind-aus-test-26'],
    window: '27 Nov – 16 Dec 2026',
    rationale: 'F1 season finale, home for cricket, return via Dubai. Double-event corporate gift.',
    liftPct: 22,
  },
]

// -----------------------------------------------------------------------------
// Personas with behavioural signal
// -----------------------------------------------------------------------------
export interface PersonaCard {
  id: Persona
  label: string
  count: number
  avgLtv: number
  tagline: string
  affinity: { cat: Category; score: number }[]
}
export const personas: PersonaCard[] = [
  {
    id: 'UHNI', label: 'Ultra-HNI', count: 412, avgLtv: 38_400_000,
    tagline: 'Private-jet regulars; paddock + pavilion; corporate gifting to peers.',
    affinity: [{ cat: 'F1', score: 96 }, { cat: 'Tennis', score: 82 }, { cat: 'Golf', score: 78 }, { cat: 'Football', score: 62 }, { cat: 'Live', score: 48 }],
  },
  {
    id: 'HNI', label: 'HNI', count: 2184, avgLtv: 8_600_000,
    tagline: 'Hospitality + premium grandstand. Buys 2-3 events a year.',
    affinity: [{ cat: 'Tennis', score: 84 }, { cat: 'F1', score: 72 }, { cat: 'Cricket', score: 68 }, { cat: 'Live', score: 62 }, { cat: 'Football', score: 54 }],
  },
  {
    id: 'Corporate', label: 'Corporate', count: 186, avgLtv: 22_400_000,
    tagline: 'Client-facing hospitality boxes. Quarterly cadence.',
    affinity: [{ cat: 'Cricket', score: 92 }, { cat: 'Football', score: 84 }, { cat: 'F1', score: 72 }, { cat: 'Tennis', score: 58 }, { cat: 'Live', score: 42 }],
  },
  {
    id: 'Family', label: 'Family', count: 948, avgLtv: 3_200_000,
    tagline: 'Multi-gen travel around a marquee event; 5-7 nights.',
    affinity: [{ cat: 'Tennis', score: 78 }, { cat: 'Live', score: 82 }, { cat: 'Cricket', score: 48 }, { cat: 'F1', score: 54 }, { cat: 'Golf', score: 36 }],
  },
  {
    id: 'Mixed', label: 'Mixed', count: 524, avgLtv: 5_100_000,
    tagline: 'Event-first buyers; discover our bundling through a single trip.',
    affinity: [{ cat: 'Live', score: 74 }, { cat: 'Tennis', score: 60 }, { cat: 'F1', score: 56 }, { cat: 'Cricket', score: 52 }, { cat: 'Football', score: 50 }],
  },
]

// -----------------------------------------------------------------------------
// Existing-customer targets per event — masked corporate & individual
// -----------------------------------------------------------------------------
export interface TargetRow {
  masked: string
  persona: Persona
  lastBooked: string
  propensity: number // 0-100
}
export const topTargetsByEvent: Record<string, TargetRow[]> = {
  'wimbledon-26': [
    { masked: 'A·M· · Bengaluru family · booked AO 25', persona: 'Family', lastBooked: 'Jan 2025', propensity: 92 },
    { masked: 'R·S· · Mumbai partner · FD Partners Cap.', persona: 'UHNI', lastBooked: 'Jul 2024', propensity: 88 },
    { masked: 'T·L· Group · Corp. board gifting', persona: 'Corporate', lastBooked: 'Dec 2024', propensity: 84 },
    { masked: 'K·K· · Delhi CXO · Repeat Wimbledon', persona: 'HNI', lastBooked: 'Jul 2023', propensity: 82 },
    { masked: 'V·N·Industries · Annual exec retreat', persona: 'Corporate', lastBooked: 'May 2025', propensity: 78 },
    { masked: 'A·G· · Pune · Anniversary trip', persona: 'HNI', lastBooked: 'Oct 2024', propensity: 74 },
  ],
  'monaco-gp-26': [
    { masked: 'S·K· · Chennai UHNI · Monaco regulars', persona: 'UHNI', lastBooked: 'May 2024', propensity: 96 },
    { masked: 'D·P· · Mumbai · Yacht + paddock 24', persona: 'UHNI', lastBooked: 'May 2024', propensity: 94 },
    { masked: 'A·V· Partners · Principal gift', persona: 'Corporate', lastBooked: 'Nov 2024', propensity: 86 },
    { masked: 'P·S· · Dubai · Repeat F1', persona: 'UHNI', lastBooked: 'Nov 2024', propensity: 82 },
  ],
  'abu-dhabi-gp-26': [
    { masked: 'P·S· · Dubai · Repeat F1', persona: 'UHNI', lastBooked: 'Nov 2024', propensity: 94 },
    { masked: 'T·L· Group · Board gifting 10pax', persona: 'Corporate', lastBooked: 'Dec 2024', propensity: 88 },
    { masked: 'K·K· · Delhi CXO · 2025 Monaco', persona: 'HNI', lastBooked: 'May 2025', propensity: 84 },
    { masked: 'R·K· · Bengaluru · First F1', persona: 'HNI', lastBooked: 'Apr 2025', propensity: 68 },
  ],
  'coldplay-mumbai-26': [
    { masked: 'A·M· · Bengaluru family', persona: 'Family', lastBooked: 'Jan 2025', propensity: 96 },
    { masked: 'R·S·', persona: 'Mixed', lastBooked: 'Jul 2024', propensity: 92 },
    { masked: 'N·L· · Delhi · Family of 5', persona: 'Family', lastBooked: 'Feb 2024', propensity: 90 },
    { masked: 'P·G· Group · Employee offsite', persona: 'Corporate', lastBooked: 'Oct 2024', propensity: 82 },
  ],
}

// -----------------------------------------------------------------------------
// Campaign suggestions
// -----------------------------------------------------------------------------
export interface Campaign {
  eventId: string
  title: string
  angle: string
  channels: ('Email' | 'WhatsApp Concierge' | 'LinkedIn' | 'Private dinners' | 'Referral')[]
  budget: number // INR
  projectedRoi: number // multiplier
  window: string
}
export const campaigns: Campaign[] = [
  {
    eventId: 'wimbledon-26', title: 'Wimbledon · The Middle Sunday',
    angle: 'Private debenture lunch for UHNI. Two families per session, no corporate branding.',
    channels: ['Email', 'Private dinners', 'Referral'], budget: 1_800_000, projectedRoi: 6.2, window: 'Apr – Jun 2026',
  },
  {
    eventId: 'wimbledon-26', title: 'Wimbledon · Corporate Quartets',
    angle: 'Four-guest corporate hospitality packages timed to H1 close.',
    channels: ['LinkedIn', 'WhatsApp Concierge'], budget: 1_200_000, projectedRoi: 4.8, window: 'May – Jun 2026',
  },
  {
    eventId: 'monaco-gp-26', title: 'Monaco · The Yacht Weekend',
    angle: 'Paddock Club + yacht berth bundle. Maximum 8 guests per vessel.',
    channels: ['Private dinners', 'Referral'], budget: 2_400_000, projectedRoi: 8.4, window: 'Feb – Apr 2026',
  },
  {
    eventId: 'abu-dhabi-gp-26', title: 'Abu Dhabi GP · Season Finale Gift',
    angle: 'Corporate board and principal-gift packages. Curated with Emirates Palace stay.',
    channels: ['Email', 'LinkedIn', 'Private dinners'], budget: 1_600_000, projectedRoi: 5.6, window: 'Aug – Oct 2026',
  },
  {
    eventId: 'ipl-final-26', title: 'IPL Final · Corporate Boxes',
    angle: 'Six-box inventory targeting client-entertainment leaders.',
    channels: ['WhatsApp Concierge', 'LinkedIn'], budget: 900_000, projectedRoi: 5.1, window: 'Mar – May 2026',
  },
  {
    eventId: 'coldplay-mumbai-26', title: 'Coldplay · Family Weekend',
    angle: 'Premium suites + dinner at Bandra. Positioned as a family memory moment.',
    channels: ['Email', 'WhatsApp Concierge'], budget: 600_000, projectedRoi: 3.8, window: 'May – Jul 2026',
  },
]

// -----------------------------------------------------------------------------
// Category labels & colours
// -----------------------------------------------------------------------------
export const categoryOrder: Category[] = ['F1', 'Tennis', 'Cricket', 'Football', 'Golf', 'Rugby', 'Live']

// -----------------------------------------------------------------------------
// AI reads — one strategic insight per section
// -----------------------------------------------------------------------------
export interface AIRead {
  section: 'board' | 'drill' | 'deep' | 'pulse' | 'persona' | 'campaign'
  tag: string
  insight: string
  confidence: number // 0–100
}
export const aiReads: AIRead[] = [
  {
    section: 'board',
    tag: 'portfolio rebalance',
    insight:
      'Masters inventory is UHNI-over-indexed and likely to oversell. Redirect 15% of hospitality to Augusta spring portfolio and reprice Sunday round +8% on 4-week lead.',
    confidence: 87,
  },
  {
    section: 'drill',
    tag: 'pricing action',
    insight:
      'Roland-Garros week-2 inventory is clearing 23% faster than 2025. Raise Chatrier-side pricing 6% on the next 48h before the final-four narrative arrives.',
    confidence: 82,
  },
  {
    section: 'deep',
    tag: 'inventory reservation',
    insight:
      'Debenture resale is +18% YoY. Historical conversion suggests reserving 9 seats for corporate inquiries scoring above 75 propensity; release remaining 32 seats to UHNI referral channel this week.',
    confidence: 91,
  },
  {
    section: 'pulse',
    tag: 'anomaly',
    insight:
      'Singapore-leg Taylor Swift demand-to-supply ratio is 40× with social velocity still rising. Repackage to premium dinner + Marina Bay suite; expected lift 22% without adding inventory.',
    confidence: 94,
  },
  {
    section: 'persona',
    tag: 'targeting',
    insight:
      'UHNI segment scores 96 on F1 and repeats every 11 months. The 412-strong cohort has a 64-person gap vs 2025 bookings — direct outreach for Abu Dhabi GP will close it.',
    confidence: 89,
  },
  {
    section: 'campaign',
    tag: 'channel reallocation',
    insight:
      'Private-dinner channel shows 8.4× ROI on Monaco vs LinkedIn at 3.1×. Scale private-dinner budget 35% and reduce paid LinkedIn by 15% across Q2 campaigns.',
    confidence: 85,
  },
]

// -----------------------------------------------------------------------------
// Live anomaly feed — 8 pulsing-dot entries for the top ticker
// -----------------------------------------------------------------------------
export interface Anomaly {
  id: string
  event: string
  signal: string
  delta: string
  severity: 'info' | 'watch' | 'action'
  ago: string
}
export const anomalies: Anomaly[] = [
  { id: 'a1', event: 'Coldplay · Mumbai', signal: 'social velocity', delta: '+52% (2.6σ)', severity: 'action', ago: '4m ago' },
  { id: 'a2', event: 'Monaco GP', signal: 'paddock sell-through', delta: '+9% DoD', severity: 'watch', ago: '12m ago' },
  { id: 'a3', event: 'Abu Dhabi GP', signal: 'Trophy lounge inventory', delta: '2 seats remaining', severity: 'action', ago: '24m ago' },
  { id: 'a4', event: 'Taylor Swift · Asia', signal: 'demand/supply ratio', delta: '40× — outlier', severity: 'action', ago: '48m ago' },
  { id: 'a5', event: 'UEFA CL Final', signal: 'news mentions', delta: '+18% since draw', severity: 'info', ago: '1h ago' },
  { id: 'a6', event: 'India v Australia Test', signal: 'day-5 pricing signal', delta: '+2.4× baseline', severity: 'watch', ago: '2h ago' },
  { id: 'a7', event: 'Roland-Garros', signal: 'second-week search', delta: '+24% WoW', severity: 'watch', ago: '3h ago' },
  { id: 'a8', event: 'Wimbledon', signal: 'debenture resale', delta: '+18% YoY', severity: 'info', ago: '4h ago' },
]
