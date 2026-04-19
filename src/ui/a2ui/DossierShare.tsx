/**
 * DossierShare — a bespoke, print-ready PDF-preview of the final plan.
 *
 * Opens from a quiet "Share dossier" affordance under the Dossier card.
 * Renders as a cream-paper document on a dark backdrop — generous
 * typography, structured sections, full fine-print. The browser's native
 * print flow (window.print with a dedicated print stylesheet) lets the
 * guest save it as a PDF without a third-party library.
 */

import { useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Printer, Share2 } from 'lucide-react'
import type { A2UIArtifact } from '@/adk/a2ui'
import { cn } from '@/lib/cn'

// -----------------------------------------------------------------------------
// Data — Vikas Mishra's F1 Abu Dhabi party
// -----------------------------------------------------------------------------
interface Party {
  primary: string
  reference: string
  issuedOn: string
  event: string
  city: string
  window: string
  nights: number
  total: string
  guests: { name: string; role: string; note?: string }[]
  stay: { name: string; nights: string; detail: string; amenities: string[] }
  hospitality: { name: string; days: string; inclusions: string[]; access: string[] }
  flights: { label: string; detail: string }[]
  transfers: string[]
  cultural: string[]
  accessibility: string[]
  dietary: string[]
  lines: { label: string; sub?: string; amount: string }[]
  concierge: { firm: string; base: string; email: string; phone: string; line24: string }
}

const F1_PARTY: Party = {
  primary: 'Mr Vikas Mishra',
  reference: 'DSSR-2025-1128-VM',
  issuedOn: '20 April 2026',
  event: 'Abu Dhabi Grand Prix',
  city: 'Yas Marina Circuit · Abu Dhabi',
  window: '28 – 30 November 2025',
  nights: 3,
  total: '₹27.41 L',
  guests: [
    { name: 'Mr Vikas Mishra', role: 'Primary guest · lead signatory', note: 'Continental palate · French and Italian leanings' },
    { name: 'Mrs Atrika Mishra', role: 'Spouse', note: 'plant-based dining across all services' },
    { name: 'Mr Rohan Kapur', role: 'Co-guest' },
    { name: 'Mrs Naina Kapur', role: 'Co-guest', note: 'step-free access · uses a powered mobility chair' },
  ],
  stay: {
    name: 'The Waldorf Astoria — Yas Marina',
    nights: '27 – 30 November 2025 · three nights',
    detail:
      'Grand Marina Suite with adjoining Deluxe Room. Step-free layout; roll-in shower; lowered bedside call button. North-lift access. Late check-out on departure day pre-arranged.',
    amenities: [
      'In-room Continental breakfast curated for Mr Vikas Mishra — eggs to order, charcuterie board, fresh pastries',
      'In-room plant-based breakfast menu configured for Mrs Atrika Mishra',
      'Dedicated butler across the stay (Omar)',
      '24-hour accessible turndown service',
      'Private arrival + luggage concierge at Abu Dhabi International',
    ],
  },
  hospitality: {
    name: 'Trophy Lounge — F1 Experiences',
    days: 'All three days · 28 – 30 November 2025',
    inclusions: [
      'Covered, climate-controlled hospitality lounge',
      'Chef-led open kitchen, continuous refreshment service',
      'Reserved grandstand seating at Turn 5 (step-free)',
      'Saturday driver Q&A · quiet front-row seating reserved',
      'Friday pit-lane walk · 15:00 window held for party of four',
    ],
    access: [
      'North gate accessible entry',
      'Step-free route from lounge to grandstand',
      'Dedicated host on call across the weekend',
    ],
  },
  flights: [
    { label: 'Outbound', detail: 'EK 508 · Mumbai (BOM) → Abu Dhabi (AUH) · 27 Nov · 21:50 / 23:05 · Business Class · four seats adjacent' },
    { label: 'Return', detail: 'EK 507 · Abu Dhabi (AUH) → Mumbai (BOM) · 01 Dec · 02:35 / 07:40 · Business Class · four seats adjacent' },
  ],
  transfers: [
    'Airport → hotel · low-floor Mercedes V-Class with power-chair ramp',
    'Hotel ↔ circuit · daily · same driver (Omar), same vehicle',
    'On-call driver across the stay, 20-minute response',
    'Return airport drop pre-sequenced with hotel late check-out',
  ],
  cultural: [
    'Private table for four at Zuma Abu Dhabi · Friday 28 Nov · 20:30',
    'Quiet morning at the Louvre Abu Dhabi · Thursday 27 Nov · private docent',
    'Farewell dinner at the Waldorf Marina restaurant · Sunday 30 Nov · 20:00',
  ],
  accessibility: [
    'Low-floor accessible vehicle reserved across all circuit movements',
    'Step-free routes pre-arranged at Abu Dhabi International arrivals + departures',
    'Turn-5 accessible grandstand held as overflow if the lounge view is preferred seated',
    'North-gate lift access from lounge to hospitality terrace confirmed with venue',
    'Medical ready-line noted with the on-ground host',
  ],
  dietary: [
    'Mr Vikas Mishra — a Continental palate across every service; classical French and Italian preparations favoured, with meat, fish, and seafood welcomed',
    'Mrs Atrika Mishra — plant-based across breakfast, lounge lunch, and evening dinners; dairy-free where possible',
    'Hospitality kitchen briefed seventy-two hours ahead, with separate prep stations and sealed service to avoid cross-contact',
    'F1 Experiences catering lead holds the allergen protocol on file, signed',
    'In-flight selections submitted per passenger — Continental for Mr Mishra, plant-based for Mrs Mishra — on both legs',
  ],
  lines: [
    { label: 'Hospitality · Trophy Lounge', sub: '4 guests × 3 days', amount: '₹17,00,000' },
    { label: 'Stay · The Waldorf Astoria — Yas Marina', sub: 'Grand Marina Suite + adjoining room, 3 nights', amount: '₹2,85,000' },
    { label: 'Flights · Mumbai ⇄ Abu Dhabi', sub: 'Emirates business class, four guests return', amount: '₹5,76,000' },
    { label: 'Accessible transfers + hospitality fees', sub: 'V-Class with power-chair ramp; hospitality entry; service', amount: '₹1,80,000' },
  ],
  concierge: {
    firm: 'Agent Concierge',
    base: 'Kala Ghoda · Mumbai 400001',
    email: 'concierge@agentconcierge.in',
    phone: '+91 98 2000 7007',
    line24: '+91 98 2000 7007 · 24/7 in-trip line · named guests only',
  },
}

// Wimbledon and Cricket carry lighter templates — same shape, different content.
const WIM_PARTY: Party = {
  primary: 'Mr Vikas Mishra',
  reference: 'DSSR-2026-0703-VM',
  issuedOn: '20 April 2026',
  event: 'The Championships · Wimbledon',
  city: 'All England Lawn Tennis Club · London',
  window: '3 – 7 July 2026',
  nights: 5,
  total: '₹70.00 L',
  guests: [
    { name: 'Mr Vikas Mishra', role: 'Primary guest', note: 'Continental palate · French and Italian leanings' },
    { name: 'Mrs Atrika Mishra', role: 'Spouse', note: 'plant-based dining' },
    { name: 'Mr Devansh Mishra', role: 'Brother' },
    { name: 'Mrs Sanya Mishra', role: 'Sister-in-law', note: 'gluten-free' },
    { name: 'Master Aarav Mishra', role: 'Son · 14' },
    { name: 'Miss Anaya Mishra', role: 'Niece · 11' },
  ],
  stay: {
    name: 'The Connaught · Mayfair',
    nights: '3 – 8 July 2026 · five nights',
    detail: 'Two adjoining Junior Suites — one for the adults, one for the children.',
    amenities: ['Family in-room breakfast menu', 'Daytime childcare brief held on call', 'Hotel-arranged Wimbledon transfer both match days'],
  },
  hospitality: {
    name: 'No.1 Court Hospitality & Centre Court Debenture',
    days: 'Saturday 4 July · Monday 6 July',
    inclusions: ['Pavilion lunch across both match days', 'Strawberries & tea service', 'Reserved seats · Centre Court for the adults on the Monday'],
    access: ['Families welcome; age-appropriate menu on the Saturday'],
  },
  flights: [
    { label: 'Outbound', detail: 'BA 138 · Mumbai (BOM) → London Heathrow (LHR) · 03 Jul · 13:45 / 18:55 · Business Class · six seats adjacent' },
    { label: 'Return', detail: 'BA 137 · London Heathrow (LHR) → Mumbai (BOM) · 08 Jul · 09:15 / 23:50 · Business Class · six seats adjacent' },
  ],
  transfers: ['Airport ↔ hotel in a 7-seater private coach', 'Hotel ↔ Wimbledon both match days', 'Matinee transfers for the West End evening'],
  cultural: ['Private V&A morning · Sunday 5 July · family guide Felix', 'Family matinee at Regents Park Open Air Theatre', 'Early dinner at The Ivy · Monday'],
  accessibility: [],
  dietary: [
    'Mr Vikas Mishra — a Continental palate; classical preparations favoured across every service',
    'Mrs Atrika Mishra — plant-based across all services',
    'Mrs Sanya Mishra — gluten-free across all services',
    'Pavilion kitchen pre-briefed; each guest carried on the roster by name with their profile',
  ],
  lines: [
    { label: 'Hospitality · No.1 Court + Centre Court debenture', sub: '6 guests × 2 match days', amount: '₹26,40,000' },
    { label: 'Stay · The Connaught · Mayfair', sub: 'Two Junior Suites · 5 nights', amount: '₹11,80,000' },
    { label: 'Flights · Mumbai ⇄ London', sub: 'British Airways business, six guests return', amount: '₹28,20,000' },
    { label: 'Cultural arrangements + private transfers', sub: 'V&A tour · theatre · car across the stay', amount: '₹3,60,000' },
  ],
  concierge: F1_PARTY.concierge,
}

const CR_PARTY: Party = {
  primary: 'Mr Vikas Mishra',
  reference: 'DSSR-2026-1212-VM',
  issuedOn: '20 April 2026',
  event: 'India v Australia · Border-Gavaskar Test',
  city: 'Wankhede Stadium · Mumbai',
  window: '12 – 13 December 2026',
  nights: 2,
  total: '₹26.60 L',
  guests: [
    { name: 'Mr Vikas Mishra · Managing Partner', role: 'Primary host' },
    { name: 'Client party of nine · named on a separate manifest', role: 'Corporate guests', note: 'manifest issued under NDA' },
  ],
  stay: {
    name: 'The Taj Mahal Palace · Apollo Bandar',
    nights: '11 – 13 December 2026 · two nights',
    detail: 'Five Heritage Wing rooms, sea-facing; corporate floor access; Sea Lounge reserved for the welcome dinner.',
    amenities: ['Private check-in ballroom, 18:30 on 11 Dec', 'Corporate floor concierge across the stay', 'Dedicated transfer manager, ground-side'],
  },
  hospitality: {
    name: 'Corporate Box · Garware End',
    days: 'Both match days · 12 + 13 December',
    inclusions: ['Private box for ten', 'Chef-led menu curated against the group\'s dietary profile', 'Open bar, hosted sommelier'],
    access: ['Dedicated on-ground host', 'Boundary-line briefing with former captain · 13 Dec 09:30'],
  },
  flights: [],
  transfers: ['Coach + lead-car to and from Wankhede both days', 'Airport transfers staggered per guest arrival', 'Return drops timed to each guest\'s outbound flight'],
  cultural: ['Welcome dinner at the Sea Lounge · 11 Dec · private room', 'Boundary-line briefing with the former India captain · 13 Dec'],
  accessibility: [],
  dietary: [
    'Group dietary manifest configured with the hospitality kitchen 72 hours ahead',
    'Vegetarian, Jain, and one gluten-free profile on the roster',
    'Non-alcoholic bar kept alongside the open bar for named guests',
  ],
  lines: [
    { label: 'Hospitality · Corporate Box · Garware End', sub: '10 guests × 2 days', amount: '₹18,40,000' },
    { label: 'Stay · The Taj Mahal Palace', sub: 'Five Heritage Wing rooms · 2 nights', amount: '₹5,40,000' },
    { label: 'Welcome dinner · transfers · dedicated host', sub: 'Sea Lounge dinner + ground-side operations', amount: '₹2,80,000' },
  ],
  concierge: F1_PARTY.concierge,
}

function partyFor(artifactId: string): Party {
  if (artifactId.startsWith('dossier.wim')) return WIM_PARTY
  if (artifactId.startsWith('dossier.cr')) return CR_PARTY
  return F1_PARTY
}

// -----------------------------------------------------------------------------
// Share affordance + dialog
// -----------------------------------------------------------------------------
export function DossierShareAffordance({ artifact }: { artifact: Extract<A2UIArtifact, { kind: 'dossier' }> }) {
  return (
    <Dialog.Root>
      <div className="mt-5 pt-4 hairline-t flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10.5px] uppercase tracking-[0.22em] text-subtle font-mono">
            reference
          </span>
          <span className="text-[12px] text-muted font-mono">
            {partyFor(artifact.id).reference}
          </span>
        </div>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[12.5px] font-medium transition-colors',
              'bg-[color:var(--accent)] text-[oklch(16%_0_0)] hover:brightness-[1.04]',
            )}
          >
            <Share2 className="size-3.5" strokeWidth={1.8} />
            Share dossier
          </button>
        </Dialog.Trigger>
      </div>
      <DossierShareDialog artifact={artifact} />
    </Dialog.Root>
  )
}

function DossierShareDialog({ artifact }: { artifact: Extract<A2UIArtifact, { kind: 'dossier' }> }) {
  const party = useMemo(() => partyFor(artifact.id), [artifact.id])
  const onPrint = () => window.print()
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[60] bg-[oklch(0%_0_0/0.7)] backdrop-blur-[2px] data-[state=open]:animate-[fadeIn_200ms_ease-out] print:hidden" />
      <Dialog.Content
        aria-describedby={undefined}
        className="fixed z-[70] inset-4 md:inset-10 rounded-[var(--radius-lg)] overflow-hidden outline-none bg-[oklch(14%_0.008_60)] border border-[color:var(--border)] shadow-[var(--shadow-lift)] flex flex-col print:static print:inset-0 print:rounded-none print:border-0 print:shadow-none"
      >
        <Dialog.Title className="sr-only">Dossier — {party.event}</Dialog.Title>
        {/* Header — hidden in print */}
        <header className="shrink-0 hairline-b flex items-center justify-between h-14 px-5 bg-elev-1 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-text">Share dossier</span>
            <span className="text-[11px] text-subtle font-mono">
              {party.reference} · ready to forward
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrint}
              className="h-8 px-3 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-elev-2 text-muted hover:text-text inline-flex items-center gap-1.5 text-[12px]"
              title="Print or save as PDF"
            >
              <Printer className="size-3.5" strokeWidth={1.5} />
              Save as PDF · print
            </button>
            <Dialog.Close asChild>
              <button aria-label="Close" className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center">
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>
        </header>

        {/* Paper on a dark stage */}
        <div className="flex-1 min-h-0 overflow-y-auto p-10 flex items-start justify-center print:p-0 print:overflow-visible">
          <Paper>
            <DossierPaper party={party} />
          </Paper>
        </div>

        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

          /* Print: show only the paper, full-bleed. */
          @media print {
            @page { size: A4; margin: 18mm 16mm; }
            html, body { background: white !important; }
          }
        `}</style>
      </Dialog.Content>
    </Dialog.Portal>
  )
}

// -----------------------------------------------------------------------------
// Paper + content
// -----------------------------------------------------------------------------
function Paper({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="dossier-paper"
      className="relative w-full max-w-[820px] rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] print:shadow-none print:max-w-none"
      style={{
        background: 'oklch(97% 0.006 82)',
        color: 'oklch(16% 0.008 60)',
      }}
    >
      <div className="p-12 md:p-16">{children}</div>
    </div>
  )
}

function DossierPaper({ party }: { party: Party }) {
  return (
    <article className="flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      <PaperHeader party={party} />
      <PaperCover party={party} />
      <Rule />

      <Section title="Guest party">
        <GuestTable guests={party.guests} />
      </Section>

      <Section title="The arrangement">
        <SubBlock title="Stay">
          <BodyLead>{party.stay.name}</BodyLead>
          <SmallMeta>{party.stay.nights}</SmallMeta>
          <Body>{party.stay.detail}</Body>
          <SmallList items={party.stay.amenities} />
        </SubBlock>
        <SubBlock title="Hospitality">
          <BodyLead>{party.hospitality.name}</BodyLead>
          <SmallMeta>{party.hospitality.days}</SmallMeta>
          <SmallList items={party.hospitality.inclusions} />
          <div className="mt-3">
            <SmallLabel>Access</SmallLabel>
            <SmallList items={party.hospitality.access} />
          </div>
        </SubBlock>
        {party.flights.length > 0 ? (
          <SubBlock title="Flights">
            {party.flights.map((f, i) => (
              <div key={i} className="mb-2">
                <SmallLabel>{f.label}</SmallLabel>
                <Body>{f.detail}</Body>
              </div>
            ))}
          </SubBlock>
        ) : null}
        <SubBlock title="Transfers & ground">
          <SmallList items={party.transfers} />
        </SubBlock>
        {party.cultural.length > 0 ? (
          <SubBlock title="Cultural threads">
            <SmallList items={party.cultural} />
          </SubBlock>
        ) : null}
      </Section>

      <Section title="Kept in mind">
        {party.accessibility.length > 0 ? (
          <SubBlock title="Accessibility">
            <SmallList items={party.accessibility} />
          </SubBlock>
        ) : null}
        {party.dietary.length > 0 ? (
          <SubBlock title="Dietary">
            <SmallList items={party.dietary} />
          </SubBlock>
        ) : null}
      </Section>

      <Section title="Financials">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {party.lines.map((l, i) => (
              <tr
                key={i}
                style={{ borderTop: i === 0 ? 'none' : '1px solid oklch(86% 0.01 80)' }}
              >
                <td className="py-3 align-top pr-4">
                  <div className="text-[13px] font-medium">{l.label}</div>
                  {l.sub ? (
                    <div className="text-[11.5px]" style={{ color: 'oklch(42% 0.01 80)' }}>
                      {l.sub}
                    </div>
                  ) : null}
                </td>
                <td className="py-3 text-right align-top font-mono text-[13px] whitespace-nowrap">
                  {l.amount}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: '1.5px solid oklch(22% 0.02 60)' }}>
              <td className="pt-3 align-top">
                <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'oklch(42% 0.01 80)' }}>
                  Total · INR · taxes included
                </div>
              </td>
              <td className="pt-3 text-right align-top">
                <span
                  className="font-mono text-[22px] font-medium"
                  style={{ fontFamily: 'var(--font-display)', fontFeatureSettings: '"tnum"' }}
                >
                  {party.total}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Terms" compact>
        <FineGrid
          items={[
            { label: 'Payment schedule', body: '50% on confirmation; balance at T-30 days. A single consolidated invoice follows within 24 hours of confirmation.' },
            { label: 'Cancellation', body: 'Complimentary up to 60 days before first arrival. 50% refund between 30 – 60 days. Non-refundable within 30 days, except in force-majeure circumstances at the organiser\'s discretion.' },
            { label: 'Third-party terms', body: 'Event organiser (F1 Experiences / All England Club / BCCI) terms apply where they differ from this arrangement. Airline terms apply to the flight legs.' },
            { label: 'Rates & quotation', body: 'INR-denominated at close of business on the issue date. Revalidation on confirmation. No additional concierge mark-up beyond the service fee included above.' },
            { label: 'Dress code & security', body: 'Each venue publishes its own protocol. We will brief your party 72 hours ahead of first entry with a concise guide.' },
            { label: 'Confidentiality', body: 'This dossier is prepared for the named party. Please treat the reference number as sensitive when forwarding.' },
          ]}
        />
      </Section>

      <Section title="Concierge">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12.5px]" style={{ color: 'oklch(28% 0.01 80)' }}>
          <SmallLabelRow label="Firm" value={party.concierge.firm} />
          <SmallLabelRow label="Base" value={party.concierge.base} />
          <SmallLabelRow label="Email" value={party.concierge.email} />
          <SmallLabelRow label="Phone" value={party.concierge.phone} />
          <SmallLabelRow label="24/7 line" value={party.concierge.line24} fullWidth />
        </div>
      </Section>

      <SignatureBlock party={party} />
    </article>
  )
}

// -----------------------------------------------------------------------------
// Paper primitives
// -----------------------------------------------------------------------------
function PaperHeader({ party }: { party: Party }) {
  return (
    <header
      className="flex items-start justify-between gap-4 pb-4"
      style={{ borderBottom: '0.5px solid oklch(72% 0.02 80)' }}
    >
      <div className="flex items-center gap-2.5">
        <svg viewBox="0 0 32 32" className="size-7">
          <circle cx="16" cy="16" r="7" fill="none" stroke="oklch(42% 0.12 65)" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="1.8" fill="oklch(42% 0.12 65)" />
        </svg>
        <span className="text-[12.5px] font-medium tracking-tight" style={{ color: 'oklch(22% 0.01 60)' }}>
          Agent Concierge
        </span>
      </div>
      <div className="text-right">
        <div className="text-[10px] uppercase tracking-[0.24em] font-medium" style={{ color: 'oklch(50% 0.01 60)' }}>
          {party.reference}
        </div>
        <div className="text-[10.5px] mt-0.5 font-mono" style={{ color: 'oklch(50% 0.01 60)' }}>
          Issued {party.issuedOn}
        </div>
      </div>
    </header>
  )
}

function PaperCover({ party }: { party: Party }) {
  return (
    <section className="mt-12 mb-12">
      <div className="text-[11px] uppercase tracking-[0.3em] font-medium" style={{ color: 'oklch(46% 0.12 65)' }}>
        Dossier
      </div>
      <h1
        className="mt-5 leading-[1.02] tracking-[-0.02em]"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 54,
          fontWeight: 500,
          color: 'oklch(14% 0.012 60)',
          fontVariationSettings: '"opsz" 96',
        }}
      >
        {party.event}
      </h1>
      <div
        className="mt-3 text-[16px]"
        style={{ fontFamily: 'var(--font-display)', color: 'oklch(30% 0.01 60)' }}
      >
        {party.city}
      </div>
      <div className="mt-12 grid grid-cols-4 gap-6">
        <CoverField label="Prepared for" value={party.primary} />
        <CoverField label="Window" value={party.window} />
        <CoverField label="Nights" value={String(party.nights)} />
        <CoverField label="Total · INR" value={party.total} emphasis />
      </div>
    </section>
  )
}

function CoverField({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'oklch(50% 0.01 60)' }}>
        {label}
      </span>
      <span
        className={cn('font-mono', emphasis ? 'text-[18px] font-medium' : 'text-[13px]')}
        style={{ color: 'oklch(14% 0.012 60)', fontFeatureSettings: '"tnum"' }}
      >
        {value}
      </span>
    </div>
  )
}

function Rule() {
  return <div className="my-2" style={{ borderTop: '0.5px solid oklch(82% 0.02 80)' }} />
}

function Section({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <section className={cn(compact ? 'mt-10' : 'mt-14')}>
      <h2
        className="mb-5 text-[22px] leading-tight tracking-[-0.01em]"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'oklch(14% 0.012 60)',
          fontWeight: 500,
          fontVariationSettings: '"opsz" 96',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function SubBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div
        className="text-[10px] uppercase tracking-[0.22em] font-medium mb-2"
        style={{ color: 'oklch(46% 0.12 65)' }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  )
}

function BodyLead({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[15px] font-medium"
      style={{ color: 'oklch(14% 0.012 60)' }}
    >
      {children}
    </div>
  )
}

function SmallMeta({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[11.5px] font-mono mt-0.5"
      style={{ color: 'oklch(42% 0.01 80)' }}
    >
      {children}
    </div>
  )
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[13px] mt-2 leading-[1.65]"
      style={{ color: 'oklch(28% 0.008 60)' }}
    >
      {children}
    </p>
  )
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[9.5px] uppercase tracking-[0.22em] font-medium mb-1"
      style={{ color: 'oklch(50% 0.01 60)' }}
    >
      {children}
    </div>
  )
}

function SmallLabelRow({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-0.5', fullWidth && 'col-span-2')}>
      <span className="text-[9.5px] uppercase tracking-[0.22em]" style={{ color: 'oklch(50% 0.01 60)' }}>
        {label}
      </span>
      <span className="font-mono text-[12px]" style={{ color: 'oklch(18% 0.01 60)' }}>
        {value}
      </span>
    </div>
  )
}

function SmallList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {items.map((t, i) => (
        <li
          key={i}
          className="text-[12.5px] pl-3 relative leading-[1.55]"
          style={{ color: 'oklch(26% 0.008 60)' }}
        >
          <span
            aria-hidden
            className="absolute left-0 top-[10px] size-1 rounded-full"
            style={{ background: 'oklch(42% 0.12 65)' }}
          />
          {t}
        </li>
      ))}
    </ul>
  )
}

function GuestTable({ guests }: { guests: Party['guests'] }) {
  return (
    <table
      className="w-full text-[12.5px]"
      style={{ borderCollapse: 'collapse', color: 'oklch(18% 0.01 60)' }}
    >
      <thead>
        <tr style={{ borderBottom: '0.5px solid oklch(82% 0.02 80)' }}>
          <th
            className="text-left py-2 pr-4 text-[9.5px] uppercase tracking-[0.22em] font-medium"
            style={{ color: 'oklch(50% 0.01 60)' }}
          >
            Guest
          </th>
          <th
            className="text-left py-2 pr-4 text-[9.5px] uppercase tracking-[0.22em] font-medium"
            style={{ color: 'oklch(50% 0.01 60)' }}
          >
            Role
          </th>
          <th
            className="text-left py-2 text-[9.5px] uppercase tracking-[0.22em] font-medium"
            style={{ color: 'oklch(50% 0.01 60)' }}
          >
            Preferences noted
          </th>
        </tr>
      </thead>
      <tbody>
        {guests.map((g, i) => (
          <tr key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid oklch(86% 0.01 80)' }}>
            <td className="py-3 pr-4 align-top font-medium">{g.name}</td>
            <td className="py-3 pr-4 align-top" style={{ color: 'oklch(34% 0.01 60)' }}>
              {g.role}
            </td>
            <td className="py-3 align-top" style={{ color: 'oklch(34% 0.01 60)' }}>
              {g.note ?? '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function FineGrid({ items }: { items: { label: string; body: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-5">
      {items.map((x, i) => (
        <div key={i}>
          <div
            className="text-[9.5px] uppercase tracking-[0.22em] font-medium mb-1.5"
            style={{ color: 'oklch(46% 0.12 65)' }}
          >
            {x.label}
          </div>
          <p className="text-[11.5px] leading-[1.55]" style={{ color: 'oklch(30% 0.01 60)' }}>
            {x.body}
          </p>
        </div>
      ))}
    </div>
  )
}

function SignatureBlock({ party }: { party: Party }) {
  return (
    <section className="mt-14 pt-6" style={{ borderTop: '0.5px solid oklch(82% 0.02 80)' }}>
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div
            className="h-10 mb-1"
            style={{ borderBottom: '0.5px solid oklch(60% 0.02 80)' }}
          />
          <div
            className="text-[10.5px] uppercase tracking-[0.22em]"
            style={{ color: 'oklch(46% 0.01 60)' }}
          >
            For the concierge
          </div>
          <div className="text-[11.5px] mt-1 font-mono" style={{ color: 'oklch(30% 0.01 60)' }}>
            {party.concierge.firm} · {party.issuedOn}
          </div>
        </div>
        <div>
          <div
            className="h-10 mb-1"
            style={{ borderBottom: '0.5px solid oklch(60% 0.02 80)' }}
          />
          <div
            className="text-[10.5px] uppercase tracking-[0.22em]"
            style={{ color: 'oklch(46% 0.01 60)' }}
          >
            For the guest
          </div>
          <div className="text-[11.5px] mt-1 font-mono" style={{ color: 'oklch(30% 0.01 60)' }}>
            {party.primary}
          </div>
        </div>
      </div>
      <div
        className="mt-10 text-[10px] text-center font-mono"
        style={{ color: 'oklch(50% 0.01 60)' }}
      >
        {party.reference} · {party.event} · page 1 of 1
      </div>
    </section>
  )
}
