/**
 * Behind the Scenes — a command-centre view for the curator planning
 * the year.
 *
 * Six sections, click-through, all mocked data:
 *   01 · Annual planning board (2026 calendar heat)
 *   02 · Category drill (Tennis as the worked example)
 *   03 · Event deep dive (Wimbledon signal dashboard)
 *   04 · Market pulse — social chatter + news + weather + clubbing
 *   05 · Persona & targeting — segments and propensity
 *   06 · Campaign planner + portfolio financials
 *
 * Intentional aesthetic: Bloomberg/Palantir — dense, monospaced numbers,
 * sparklines, heat strips. Champagne as the single action colour.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import {
  X,
  ArrowLeft,
  ArrowRight,
  Radar,
  LayoutDashboard,
  Trophy,
  Target,
  Activity,
  CloudSun,
  Users,
  Megaphone,
  Sparkles,
  Globe,
  Search,
  CornerDownLeft,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  events2026,
  weekendHeat,
  weatherSnapshots,
  holidays2026,
  clubbingOpportunities,
  personas,
  topTargetsByEvent,
  campaigns,
  categoryOrder,
  aiReads,
  anomalies,
  cityCoords,
  provenanceFeed,
  type EventRow,
  type Action,
  type Persona,
  type AIRead,
  type Anomaly,
  type Category,
} from './behindData'

// -----------------------------------------------------------------------------
// Shared formatters + tokens
// -----------------------------------------------------------------------------
const ACCENT = 'var(--accent)'
const TRACE = 'var(--trace)'

function fmtLakh(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

function actionTone(a: Action): { fg: string; bg: string; dot: string } {
  switch (a) {
    case 'Push':
      return { fg: 'text-[color:var(--accent)]', bg: 'bg-[color:var(--accent-soft)] border-[color:var(--accent-soft)]', dot: 'bg-[color:var(--accent)]' }
    case 'Hold':
      return { fg: 'text-[color:var(--trace)]', bg: 'bg-[color:var(--trace-soft)] border-[color:var(--trace-soft)]', dot: 'bg-[color:var(--trace)]' }
    case 'Monitor':
      return { fg: 'text-muted', bg: 'bg-elev-2 border-[color:var(--border)]', dot: 'bg-muted' }
    case 'Skip':
      return { fg: 'text-[color:var(--danger)]', bg: 'bg-[oklch(68%_0.15_25/0.12)] border-[oklch(68%_0.15_25/0.18)]', dot: 'bg-[color:var(--danger)]' }
  }
}

// -----------------------------------------------------------------------------
// Cross-section nav context: drill into a specific event from the board
// and the category drill, and read/write which event the deep-dive shows.
// -----------------------------------------------------------------------------
interface NavCtx {
  goToSection: (id: string) => void
  focusEvent: (eventId: string) => void
  focusedEventId: string
}
const Nav = createContext<NavCtx | null>(null)
function useNav(): NavCtx {
  const ctx = useContext(Nav)
  if (!ctx) throw new Error('Nav context missing')
  return ctx
}

// -----------------------------------------------------------------------------
// Sections + nav
// -----------------------------------------------------------------------------
interface Section {
  id: string
  aiSection: AIRead['section']
  label: string
  sub: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  body: React.ComponentType
}

const SECTIONS: Section[] = [
  { id: 'board', aiSection: 'board', label: 'Annual planning board', sub: '2026 · all categories', icon: LayoutDashboard, body: AnnualBoard },
  { id: 'world', aiSection: 'pulse', label: 'Global reach', sub: 'world map · demand by venue', icon: Globe, body: WorldReach },
  { id: 'drill', aiSection: 'drill', label: 'Category drill · Tennis', sub: 'leagues · signals · recommendation', icon: Trophy, body: CategoryDrill },
  { id: 'deep', aiSection: 'deep', label: 'Event deep dive', sub: 'signal dashboard + scenario sim', icon: Target, body: EventDeepDive },
  { id: 'pulse', aiSection: 'pulse', label: 'Market pulse & context', sub: 'social · news · weather · clubbing', icon: Activity, body: MarketPulse },
  { id: 'persona', aiSection: 'persona', label: 'Persona & targeting', sub: 'segments · match × event · propensity', icon: Users, body: PersonaTargeting },
  { id: 'campaign', aiSection: 'campaign', label: 'Campaigns & portfolio', sub: 'channel plan · ROI · ratios', icon: Megaphone, body: CampaignsPortfolio },
]

export function BehindTheScenesButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[color:var(--border)] bg-elev-1 text-muted hover:text-text hover:border-[color:var(--border-strong)] transition-colors text-[11px] font-medium"
        title="Behind the scenes — the planning command centre"
      >
        <Radar className="size-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">behind the scenes</span>
      </button>
      <BehindTheScenes open={open} onOpenChange={setOpen} />
    </>
  )
}

function BehindTheScenes({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [idx, setIdx] = useState(0)
  const [focusedEventId, setFocusedEventId] = useState<string>('wimbledon-26')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const Sec = SECTIONS[idx]!.body
  const activeSection = SECTIONS[idx]!
  const currentRead = aiReads.find((r) => r.section === activeSection.aiSection)

  useEffect(() => {
    if (!open) {
      setIdx(0)
      setFocusedEventId('wimbledon-26')
      setPaletteOpen(false)
    }
  }, [open])
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((p) => !p)
        return
      }
      if (paletteOpen) return
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(SECTIONS.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, paletteOpen])

  const navCtx = useMemo<NavCtx>(
    () => ({
      goToSection: (id) => {
        const i = SECTIONS.findIndex((s) => s.id === id)
        if (i >= 0) setIdx(i)
      },
      focusEvent: (eventId) => setFocusedEventId(eventId),
      focusedEventId,
    }),
    [focusedEventId],
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[oklch(0%_0_0/0.55)] backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 inset-2 md:inset-4 lg:inset-6 rounded-[var(--radius-2xl)] overflow-hidden outline-none',
            'bg-surface border border-[color:var(--border)] shadow-[var(--shadow-lift)] flex flex-col',
          )}
        >
          {/* Header */}
          <header className="shrink-0 hairline-b flex items-center justify-between h-14 px-5 bg-elev-1">
            <div className="flex items-center gap-3">
              <Dialog.Title className="text-[15px] font-medium tracking-tight">Behind the scenes</Dialog.Title>
              <span className="text-[11px] text-subtle font-mono">
                COMMAND CENTRE · 2026 PLANNING · EVENT SOURCING INTELLIGENCE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="h-8 pl-2.5 pr-3 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-elev-2 text-muted hover:text-text hover:border-[color:var(--border-strong)] inline-flex items-center gap-2 text-[11.5px]"
                title="Command palette"
              >
                <Search className="size-3.5" strokeWidth={1.5} />
                <span>quick jump</span>
                <kbd className="ml-1 font-mono text-[10px] text-subtle border border-[color:var(--border)] bg-elev-1 rounded px-1.5 py-0.5">⌘K</kbd>
              </button>
              <Dialog.Close asChild>
                <button aria-label="Close" className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center">
                  <X className="size-4" strokeWidth={1.5} />
                </button>
              </Dialog.Close>
            </div>
          </header>

          {/* Live anomaly ticker */}
          <AnomalyTicker />

          <Nav.Provider value={navCtx}>

          <div className="flex min-h-0 flex-1">
            {/* Sidebar */}
            <nav className="hairline-r w-64 shrink-0 bg-elev-1 flex flex-col">
              <div className="p-4 pb-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-subtle font-medium font-mono">
                  sections
                </span>
              </div>
              <ul className="flex-1 px-2 pb-2">
                {SECTIONS.map((s, i) => {
                  const active = i === idx
                  const Icon = s.icon
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setIdx(i)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-[var(--radius-sm)] flex items-start gap-2.5 transition-colors',
                          active
                            ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                            : 'text-muted hover:text-text hover:bg-elev-2',
                        )}
                      >
                        <Icon className="size-3.5 mt-[2px] shrink-0" strokeWidth={1.5} />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[12.5px] font-medium leading-snug">
                            <span className="text-subtle font-mono mr-1">{String(i + 1).padStart(2, '0')}</span>
                            {s.label}
                          </span>
                          <span className={cn('text-[10.5px] leading-snug', active ? 'text-[color:var(--accent)] opacity-80' : 'text-subtle')}>
                            {s.sub}
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <ProvenanceRail />
              <footer className="hairline-t p-3 flex items-center justify-between text-[10.5px] text-subtle font-mono">
                <span>ADK · planning layer</span>
                <span>2026 · mock</span>
              </footer>
            </nav>

            {/* Main content */}
            <main className="min-w-0 flex-1 overflow-y-auto bg-surface">
              <AnimatePresence mode="wait">
                <motion.div
                  key={SECTIONS[idx]!.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="p-8 flex flex-col gap-6"
                >
                  <Sec />
                  {currentRead ? <AIReadCallout read={currentRead} /> : null}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          </Nav.Provider>

          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            onJump={(sectionId, eventId) => {
              const i = SECTIONS.findIndex((s) => s.id === sectionId)
              if (i >= 0) setIdx(i)
              if (eventId) setFocusedEventId(eventId)
              setPaletteOpen(false)
            }}
          />

          {/* Footer controls */}
          <footer className="shrink-0 hairline-t flex items-center justify-between h-14 px-5 bg-elev-1">
            <div className="flex items-center gap-2 text-[11px] text-subtle font-mono">
              <span>SECTION {String(idx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')}</span>
              <span className="text-border">·</span>
              <span className="hidden md:inline">{SECTIONS[idx]!.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                className="h-8 px-3 rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-elev-2 text-muted hover:text-text disabled:opacity-30 inline-flex items-center gap-1.5 text-[12px]"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                Prev
              </button>
              <button
                type="button"
                disabled={idx === SECTIONS.length - 1}
                onClick={() => setIdx((i) => Math.min(SECTIONS.length - 1, i + 1))}
                className="h-8 px-3 rounded-[var(--radius-sm)] bg-[color:var(--accent)] text-[oklch(16%_0_0)] disabled:opacity-30 inline-flex items-center gap-1.5 text-[12px] font-medium"
              >
                Next
                <ArrowRight className="size-3.5" strokeWidth={1.8} />
              </button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// =============================================================================
// SECTION 01 — Annual planning board
// =============================================================================
function AnnualBoard() {
  const nav = useNav()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const weeks = weekendHeat()
  const marquee = weeks.filter((w) => w.note).sort((a, b) => b.intensity - a.intensity).slice(0, 6)
  const drill = (eventId: string) => {
    nav.focusEvent(eventId)
    nav.goToSection('deep')
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="01 · annual planning board"
        title="2026 · every marquee event, plotted."
        blurb="A 12-month lane-view across the categories we source. Heat = composite demand index (social velocity + news mentions + search trend + inquiry flow, weighted). The curator scans for clusters, conflicts, and underbooked windows."
      />

      {/* Month header */}
      <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1 overflow-hidden">
        <div className="grid grid-cols-[120px_repeat(12,1fr)] hairline-b bg-elev-2">
          <div className="px-3 py-2 text-[10px] font-mono tracking-[0.16em] uppercase text-subtle">category</div>
          {months.map((m, i) => (
            <div key={m} className="px-2 py-2 text-center text-[10px] font-mono tracking-[0.12em] uppercase text-subtle">
              {m}
              <span className="ml-1 text-[9px] opacity-60">· {String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        {categoryOrder.map((cat) => {
          const rows = events2026.filter((e) => e.category === cat)
          return (
            <div key={cat} className="grid grid-cols-[120px_repeat(12,1fr)] hairline-b">
              <div className="px-3 py-3 text-[12px] font-medium text-text">{cat}</div>
              {Array.from({ length: 12 }, (_, mi) => {
                const m = mi + 1
                const inMonth = rows.filter((e) => e.month === m)
                return (
                  <div key={m} className="relative px-1.5 py-2 min-h-[46px]">
                    {inMonth.map((e) => {
                      const intensity = e.demand / 100
                      const bg = `color-mix(in oklab, var(--accent) ${Math.round(10 + intensity * 70)}%, transparent)`
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => drill(e.id)}
                          className="w-full rounded-[6px] border text-[10px] px-1.5 py-1 leading-tight font-medium text-text/90 text-left hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] transition"
                          style={{ background: bg, borderColor: 'color-mix(in oklab, var(--accent) 40%, transparent)' }}
                          title={`${e.name} — demand ${e.demand}, ${fmtLakh(e.revenuePotential)} · click to deep-dive`}
                        >
                          <div className="truncate">{e.name.replace(/·.+/, '').trim().slice(0, 22)}</div>
                          <div className="flex items-baseline justify-between mt-0.5">
                            <span className="font-mono text-[9px] opacity-75">{e.city.slice(0, 3).toUpperCase()}</span>
                            <span className="font-mono text-[9px] opacity-90">{e.demand}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Panel title="Top 6 marquee weekends" sub="composite demand ≥ 90">
          <ul className="flex flex-col gap-3">
            {marquee.map((w) => (
              <li key={w.week} className="flex items-center gap-3 text-[12.5px]">
                <span className="font-mono text-subtle w-14">WK{String(w.week).padStart(2, '0')}</span>
                <span className="flex-1 text-text">{w.note}</span>
                <span className="h-1.5 w-24 rounded-full bg-elev-2 overflow-hidden">
                  <span className="block h-full bg-[color:var(--accent)]" style={{ width: `${w.intensity}%` }} />
                </span>
                <span className="font-mono text-[11px] text-[color:var(--accent)]">{w.intensity}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Category exposure" sub="inventory × demand, Cr">
          <ul className="flex flex-col gap-2.5 text-[12px]">
            {categoryOrder.map((c) => {
              const rows = events2026.filter((e) => e.category === c)
              const rev = rows.reduce((s, r) => s + r.revenuePotential, 0)
              const avgDemand = rows.length ? Math.round(rows.reduce((s, r) => s + r.demand, 0) / rows.length) : 0
              return (
                <li key={c} className="flex items-center gap-3">
                  <span className="w-16 text-muted">{c}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="h-1.5 rounded-full bg-[color:var(--trace)]" style={{ width: `${Math.min(100, rev / 600_000)}%` }} />
                    <span className="font-mono text-[11px] text-muted">{rows.length}ev</span>
                  </div>
                  <span className="font-mono text-[11px] text-text w-16 text-right">{fmtLakh(rev)}</span>
                  <span className="font-mono text-[11px] text-[color:var(--accent)] w-10 text-right">{avgDemand}</span>
                </li>
              )
            })}
          </ul>
        </Panel>
        <Panel title="Conflicts + clubbing" sub="opportunities across weeks">
          <ul className="flex flex-col gap-3 text-[12px]">
            {clubbingOpportunities.slice(0, 4).map((c) => (
              <li key={c.name} className="flex flex-col gap-0.5">
                <span className="text-text font-medium">{c.name}</span>
                <span className="text-subtle text-[10.5px]">{c.window}</span>
                <span className="text-muted text-[11px] leading-snug">{c.rationale}</span>
                <span className="mt-1 text-[10px] font-mono text-[color:var(--accent)]">
                  + {c.liftPct}% revenue lift
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

// =============================================================================
// SECTION 02 — Category drill (Tennis)
// =============================================================================
function CategoryDrill() {
  const rows = events2026.filter((e) => e.category === 'Tennis')
  const nav = useNav()
  const drill = (eventId: string) => {
    nav.focusEvent(eventId)
    nav.goToSection('deep')
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="02 · category drill · Tennis"
        title="Leagues, tournaments, signal reads."
        blurb="Four Grand Slams, the axis of the tennis year. Columns compress the composite demand picture into a single scan — sparkline = 12-week demand trajectory, signal chips show which inputs are driving it, the right column gives the curator's recommended action."
      />

      <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1 overflow-hidden">
        <div className="grid grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1fr_1.2fr_0.9fr] hairline-b bg-elev-2 text-[10.5px] font-mono tracking-[0.14em] uppercase text-subtle">
          <Col>tournament</Col>
          <Col>window</Col>
          <Col>demand</Col>
          <Col>social w/w</Col>
          <Col>search</Col>
          <Col>inquiry/d</Col>
          <Col>12-wk trajectory</Col>
          <Col className="text-right">action</Col>
        </div>
        {rows.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => drill(e.id)}
            onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && drill(e.id)}
            className="grid grid-cols-[1.7fr_1fr_1fr_1fr_1fr_1fr_1.2fr_0.9fr] hairline-b text-[12px] cursor-pointer hover:bg-elev-2 transition-colors"
          >
            <Col>
              <div className="font-medium text-text">{e.name}</div>
              <div className="text-subtle text-[10.5px]">{e.city} · {e.country}</div>
            </Col>
            <Col><span className="font-mono text-muted">{e.start}</span></Col>
            <Col>
              <span className="inline-flex items-center gap-2">
                <span className="h-1 w-10 rounded-full bg-elev-2 overflow-hidden"><span className="block h-full bg-[color:var(--accent)]" style={{ width: `${e.demand}%` }} /></span>
                <span className="font-mono text-text">{e.demand}</span>
              </span>
            </Col>
            <Col>
              <span className={cn('font-mono', e.socialVelocity >= 0 ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]')}>
                {e.socialVelocity >= 0 ? '+' : ''}{e.socialVelocity}%
              </span>
            </Col>
            <Col><span className="font-mono text-muted">{e.searchTrend}</span></Col>
            <Col><span className="font-mono text-muted">{e.inquiryVelocity}</span></Col>
            <Col><Sparkline points={e.curve} /></Col>
            <Col className="text-right">
              <ActionChip action={e.action} />
            </Col>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Panel title="Signal attribution" sub="what's moving Wimbledon 2026">
          <SignalBars signals={rows.find((r) => r.id === 'wimbledon-26')!.signals} />
        </Panel>
        <Panel title="Revenue concentration" sub="% of tennis revenue by tournament">
          <ul className="flex flex-col gap-2.5 text-[12px]">
            {rows.map((e) => {
              const total = rows.reduce((s, r) => s + r.revenuePotential, 0)
              const pct = Math.round((e.revenuePotential / total) * 100)
              return (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="w-28 text-muted truncate">{e.name.split(',')[0]}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-elev-2 overflow-hidden">
                    <span className="block h-full bg-[color:var(--accent)]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-text w-12 text-right">{pct}%</span>
                  <span className="font-mono text-[11px] text-subtle w-20 text-right">{fmtLakh(e.revenuePotential)}</span>
                </li>
              )
            })}
          </ul>
        </Panel>
        <Panel title="Key ratios" sub="rolled up across tennis">
          <KeyRatios rows={rows} />
        </Panel>
      </div>
    </div>
  )
}

// =============================================================================
// SECTION 03 — Event deep dive (dynamic event selector)
// =============================================================================
function EventDeepDive() {
  const nav = useNav()
  const e = events2026.find((ev) => ev.id === nav.focusedEventId) ?? events2026.find((ev) => ev.id === 'wimbledon-26')!
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="03 · event deep dive"
        title={`${e.name} · ${e.start.slice(0, 7)}`}
        blurb="Every signal the curator needs to decide how much inventory to hold, at what price, for whom. Market demand, supply state, persona split, recommended inventory pushes and the rationale behind them."
      />
      <EventSelector focusedId={e.id} onSelect={(id) => nav.focusEvent(id)} />

      <div className="grid grid-cols-4 gap-4">
        <Metric label="Composite demand" value={e.demand} max={100} accent />
        <Metric label="Revenue potential" value={e.revenuePotential} money />
        <Metric label="Avg order value" value={e.aov} money />
        <Metric label="Attach rate · hospitality" value={e.attachRate} pct />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Metric label="Gross margin" value={e.margin} pct />
        <Metric label="Inventory remaining" value={e.inventoryRemaining} sub={`of ${e.inventoryHeld} held`} />
        <Metric label="News mentions 30d" value={e.newsMentions} numeric />
        <Metric label="Inquiry velocity" value={e.inquiryVelocity} sub="inquiries/day" />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <Panel title="Demand trajectory" sub="12-week composite index">
          <div className="h-[200px] px-2 pb-2">
            <BigSparkline points={e.curve} />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-3 text-[11px] font-mono">
            <span className="text-subtle">T-12 wks <span className="text-muted ml-1">{e.curve[0]}</span></span>
            <span className="text-subtle">T-8 wks <span className="text-muted ml-1">{e.curve[4]}</span></span>
            <span className="text-subtle">T-4 wks <span className="text-muted ml-1">{e.curve[8]}</span></span>
            <span className="text-subtle">Today <span className="text-[color:var(--accent)] ml-1">{e.curve[e.curve.length - 1]}</span></span>
          </div>
        </Panel>
        <Panel title="Signal strength" sub="what's driving the reading">
          <SignalBars signals={e.signals} />
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Panel title="Persona mix" sub="% of inventory by segment">
          <PersonaBar mix={e.personaMix} />
        </Panel>
        <Panel title="Past attendees · 2024-25" sub="repeat likely within this persona mix">
          <ul className="flex flex-col gap-2 text-[12px]">
            {(topTargetsByEvent[e.id] ?? []).slice(0, 5).map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-text truncate">{t.masked}</span>
                  <span className="text-subtle text-[10.5px]">{t.persona} · last booked {t.lastBooked}</span>
                </div>
                <span className="font-mono text-[11px] text-[color:var(--accent)] shrink-0">{t.propensity}</span>
              </li>
            ))}
            {(topTargetsByEvent[e.id] ?? []).length === 0 ? (
              <li className="text-subtle text-[11px] italic">No historical attendee match in CRM — cold-outreach cohort will be generated.</li>
            ) : null}
          </ul>
        </Panel>
        <Panel title="Recommendation" sub="curator action + rationale">
          <div className="flex items-start gap-3">
            <ActionChip action={e.action} />
            <span className="text-[12.5px] text-text leading-relaxed">{e.rationale}</span>
          </div>
          <div className="hairline-t mt-4 pt-4 text-[11.5px] text-muted leading-relaxed">
            Push 40% of remaining inventory via UHNI referral channel. Reprice Centre Court debenture +8% on 3-week lead. Reserve 9 seats for corporate concierge inquiries converting {'>'} 75% propensity.
          </div>
        </Panel>
      </div>

      <ScenarioSimulator event={e} />
    </div>
  )
}

// =============================================================================
// SECTION 04 — Market pulse + context
// =============================================================================
function MarketPulse() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="04 · market pulse & context"
        title="Signals from outside our inventory."
        blurb="Social chatter, news mentions, weather forecasts, holiday calendars, and clubbing opportunities — the context layer the curator reads before committing to a push."
      />

      <div className="grid grid-cols-[2fr_1.2fr] gap-6">
        <Panel title="Social chatter — weekly volume" sub="Instagram + X + TikTok, last 12 weeks">
          <div className="flex flex-col gap-3">
            {events2026.slice(0, 7).map((e) => (
              <div key={e.id} className="flex items-center gap-3 text-[12px]">
                <span className="w-40 text-muted truncate">{e.name.split('·')[0].trim()}</span>
                <div className="flex-1 flex gap-[2px]">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = 8 + Math.abs(Math.sin(i * 0.7 + e.demand * 0.01)) * (e.demand / 4)
                    const lastFew = i >= 9
                    return (
                      <span
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}px`,
                          background: lastFew ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 40%, transparent)',
                          alignSelf: 'end',
                        }}
                      />
                    )
                  })}
                </div>
                <span className="font-mono text-[10.5px] text-subtle w-16 text-right">
                  {fmtK(e.newsMentions + Math.round(e.searchTrend * 320))}
                </span>
                <span className={cn('font-mono text-[10.5px] w-12 text-right', e.socialVelocity > 20 ? 'text-[color:var(--accent)]' : 'text-muted')}>
                  {e.socialVelocity >= 0 ? '+' : ''}{e.socialVelocity}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="News mentions · 30d" sub="curated press, per event">
          <ul className="flex flex-col gap-2 text-[12px]">
            {events2026
              .slice()
              .sort((a, b) => b.newsMentions - a.newsMentions)
              .slice(0, 7)
              .map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="flex-1 truncate text-muted">{e.name.split('·')[0].trim()}</span>
                  <div className="w-28 h-1 rounded-full bg-elev-2 overflow-hidden">
                    <span className="block h-full bg-[color:var(--trace)]" style={{ width: `${Math.min(100, e.newsMentions / 90)}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-text w-14 text-right">{fmtK(e.newsMentions)}</span>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <Panel title="Weather & venue conditions" sub="major cities, mocked forecast">
          <div className="grid grid-cols-2 gap-3">
            {weatherSnapshots.slice(0, 10).map((w, i) => (
              <div key={i} className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-elev-2 p-3 flex items-start gap-3">
                <CloudSun className="size-4 mt-[2px] text-[color:var(--trace)]" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] text-text font-medium">{w.city}</span>
                    <span className="font-mono text-[10.5px] text-subtle">M{String(w.month).padStart(2, '0')}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-[11px] text-text">{w.hiC}° / {w.loC}°</span>
                    <span className="font-mono text-[10px] text-subtle">· {w.rainDays}d rain</span>
                  </div>
                  <div className="text-[11px] text-muted mt-1 leading-snug">{w.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Holiday calendar overlap" sub="market × travel demand">
          <ul className="flex flex-col gap-2 text-[12px]">
            {holidays2026.map((h) => (
              <li key={h.date + h.name} className="grid grid-cols-[90px_1fr_110px] gap-2 items-center">
                <span className="font-mono text-[10.5px] text-subtle">{h.date}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[9.5px] font-mono text-muted px-1.5 py-0.5 rounded border border-[color:var(--border)]">{h.market}</span>
                  <span className="text-text truncate">{h.name}</span>
                </span>
                <span className={cn('text-right font-mono text-[10.5px]',
                  h.travelDemand === 'very-high' ? 'text-[color:var(--accent)]' :
                  h.travelDemand === 'high' ? 'text-[color:var(--trace)]' : 'text-muted')}>
                  {h.travelDemand}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Clubbing opportunities" sub="events that travel together">
        <div className="grid grid-cols-2 gap-4">
          {clubbingOpportunities.map((c) => (
            <div key={c.name} className="rounded-[var(--radius-sm)] border border-[color:var(--border)] p-4 bg-elev-2 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-text">{c.name}</span>
                <span className="text-[10.5px] font-mono text-[color:var(--accent)]">+{c.liftPct}%</span>
              </div>
              <span className="text-[11px] text-subtle font-mono">{c.window}</span>
              <p className="text-[12px] text-muted leading-relaxed">{c.rationale}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// =============================================================================
// SECTION 05 — Persona & targeting
// =============================================================================
function PersonaTargeting() {
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="05 · persona & targeting"
        title="Who buys what. Who to target next."
        blurb="Five customer segments. Affinity scores per category. Match matrix pairs every persona with every marquee event. Right column lifts the highest-propensity existing customers per event for direct concierge outreach."
      />

      <div className="grid grid-cols-5 gap-4">
        {personas.map((p) => (
          <Panel key={p.id} padded={false}>
            <div className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-medium text-text">{p.label}</span>
                <span className="font-mono text-[11px] text-subtle">{p.count.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-muted leading-snug mt-2 min-h-[50px]">{p.tagline}</p>
              <div className="hairline-t mt-3 pt-3 flex items-baseline justify-between">
                <span className="text-[10px] uppercase tracking-[0.16em] text-subtle font-mono">avg LTV</span>
                <span className="font-mono text-[11.5px] text-[color:var(--accent)]">{fmtLakh(p.avgLtv)}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Persona × category affinity" sub="0–100, higher = better fit">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4 text-subtle font-mono text-[10.5px] uppercase tracking-[0.14em]">persona</th>
                {categoryOrder.map((c) => (
                  <th key={c} className="py-2 px-3 text-subtle font-mono text-[10.5px] uppercase tracking-[0.14em]">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.id} className="hairline-t">
                  <td className="py-3 pr-4 text-text font-medium">{p.label}</td>
                  {categoryOrder.map((c) => {
                    const score = p.affinity.find((a) => a.cat === c)?.score ?? 0
                    return (
                      <td key={c} className="py-3 px-3">
                        <HeatCell score={score} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-6">
        <Panel title="Top-propensity existing customers" sub="Wimbledon 2026 — mask preserved">
          <TargetList rows={topTargetsByEvent['wimbledon-26'] ?? []} />
        </Panel>
        <Panel title="Top-propensity existing customers" sub="Abu Dhabi GP 2026 — mask preserved">
          <TargetList rows={topTargetsByEvent['abu-dhabi-gp-26'] ?? []} />
        </Panel>
      </div>
    </div>
  )
}

function TargetList({ rows }: { rows: { masked: string; persona: Persona; lastBooked: string; propensity: number }[] }) {
  return (
    <ul className="flex flex-col gap-2 text-[12px]">
      {rows.map((t, i) => (
        <li key={i} className="grid grid-cols-[1.2fr_90px_90px_60px] items-center gap-3">
          <span className="text-text truncate">{t.masked}</span>
          <span className="text-subtle text-[10.5px] font-mono">{t.persona}</span>
          <span className="text-subtle text-[10.5px] font-mono">{t.lastBooked}</span>
          <span className="text-right">
            <span className="font-mono text-[11px] text-[color:var(--accent)]">{t.propensity}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// =============================================================================
// SECTION 06 — Campaigns + portfolio
// =============================================================================
function CampaignsPortfolio() {
  const byRev = [...events2026].sort((a, b) => b.revenuePotential - a.revenuePotential).slice(0, 10)
  const totalRev = events2026.reduce((s, e) => s + e.revenuePotential, 0)
  const avgMargin = Math.round(events2026.reduce((s, e) => s + e.margin, 0) / events2026.length)
  const avgAttach = Math.round(events2026.reduce((s, e) => s + e.attachRate, 0) / events2026.length)
  const avgAov = Math.round(events2026.reduce((s, e) => s + e.aov, 0) / events2026.length)
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="06 · campaigns & portfolio"
        title="Where the budget goes. What it returns."
        blurb="Campaigns suggested per event, with channel, budget, and projected ROI. Portfolio block rolls up the 2026 book into the ratios that actually matter to the concierge operator."
      />

      <div className="grid grid-cols-4 gap-4">
        <Metric label="2026 revenue potential" value={totalRev} money />
        <Metric label="Avg gross margin" value={avgMargin} pct />
        <Metric label="Avg hospitality attach" value={avgAttach} pct />
        <Metric label="Avg AOV / guest" value={avgAov} money />
      </div>

      <Panel title="Suggested campaigns" sub="per-event play · channel · budget · ROI">
        <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_0.9fr] hairline-b bg-elev-2 text-[10.5px] font-mono tracking-[0.14em] uppercase text-subtle">
            <Col>event · campaign</Col>
            <Col>angle</Col>
            <Col>channels</Col>
            <Col className="text-right">budget</Col>
            <Col className="text-right">ROI</Col>
          </div>
          {campaigns.map((c) => {
            const ev = events2026.find((e) => e.id === c.eventId)
            return (
              <div key={c.title} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_0.9fr] hairline-b text-[12px]">
                <Col>
                  <div className="text-text font-medium">{c.title}</div>
                  <div className="text-subtle text-[10.5px]">{ev?.name}</div>
                </Col>
                <Col><span className="text-muted leading-snug">{c.angle}</span></Col>
                <Col>
                  <div className="flex flex-wrap gap-1">
                    {c.channels.map((ch) => (
                      <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded-full border border-[color:var(--border)] text-muted bg-elev-1">
                        {ch}
                      </span>
                    ))}
                  </div>
                </Col>
                <Col className="text-right"><span className="font-mono text-text">{fmtLakh(c.budget)}</span></Col>
                <Col className="text-right"><span className="font-mono text-[color:var(--accent)]">{c.projectedRoi.toFixed(1)}×</span></Col>
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-[1.5fr_1fr] gap-6">
        <Panel title="Top 10 by revenue potential" sub="2026 portfolio, concentrated book">
          <ul className="flex flex-col gap-2 text-[12px]">
            {byRev.map((e) => {
              const pct = Math.round((e.revenuePotential / totalRev) * 100)
              return (
                <li key={e.id} className="grid grid-cols-[1.8fr_1fr_80px_60px] gap-3 items-center">
                  <span className="text-text truncate">{e.name}</span>
                  <div className="h-1.5 rounded-full bg-elev-2 overflow-hidden">
                    <span className="block h-full bg-[color:var(--accent)]" style={{ width: `${(e.revenuePotential / byRev[0]!.revenuePotential) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-text text-right">{fmtLakh(e.revenuePotential)}</span>
                  <span className="font-mono text-[11px] text-[color:var(--accent)] text-right">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </Panel>
        <Panel title="Portfolio ratios" sub="what the CFO looks at">
          <ul className="flex flex-col gap-3 text-[12px]">
            <Ratio label="Revenue per event" value={fmtLakh(Math.round(totalRev / events2026.length))} />
            <Ratio label="Demand / inventory ratio" value="2.4×" tone="accent" />
            <Ratio label="Hospitality attach rate" value={`${avgAttach}%`} />
            <Ratio label="Repeat customer share" value="58%" />
            <Ratio label="Concierge premium vs list" value="+34%" tone="accent" />
            <Ratio label="Avg days to sell-out (top 5)" value="18 days" />
            <Ratio label="Campaign blended ROI" value="5.4×" tone="accent" />
            <Ratio label="Gross margin · book" value={`${avgMargin}%`} />
          </ul>
        </Panel>
      </div>
    </div>
  )
}

// =============================================================================
// Shared sub-components
// =============================================================================

function SectionHead({ kicker, title, blurb }: { kicker: string; title: string; blurb: string }) {
  return (
    <header className="flex flex-col gap-3 max-w-[780px]">
      <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--accent)] font-medium font-mono">
        {kicker}
      </span>
      <h2 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.015em] text-text">{title}</h2>
      <p className="text-[13px] text-muted leading-[1.65]">{blurb}</p>
    </header>
  )
}

function Panel({
  title,
  sub,
  children,
  padded = true,
}: {
  title?: string
  sub?: string
  children: React.ReactNode
  padded?: boolean
}) {
  return (
    <section className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1">
      {title ? (
        <div className={cn('hairline-b', padded ? 'px-5 py-3' : 'px-4 py-2.5')}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12.5px] font-medium text-text">{title}</span>
            {sub ? <span className="text-[10.5px] text-subtle font-mono">{sub}</span> : null}
          </div>
        </div>
      ) : null}
      <div className={cn(padded ? 'p-5' : '')}>{children}</div>
    </section>
  )
}

function Col({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3 flex flex-col justify-center min-w-0', className)}>{children}</div>
}

function ActionChip({ action }: { action: Action }) {
  const tone = actionTone(action)
  return (
    <span className={cn('inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[10.5px] font-medium', tone.bg, tone.fg)}>
      <span className={cn('size-1.5 rounded-full', tone.dot)} />
      {action}
    </span>
  )
}

function Sparkline({ points, width = 140, height = 36 }: { points: number[]; width?: number; height?: number }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = height - ((p - min) / range) * (height - 4) - 2
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} className="block">
      <path d={path} stroke={`oklch(78% 0.12 85)`} strokeWidth={1.2} fill="none" />
      <circle
        cx={(points.length - 1) * step}
        cy={height - ((points[points.length - 1]! - min) / range) * (height - 4) - 2}
        r={2.5}
        fill={`oklch(78% 0.12 85)`}
      />
    </svg>
  )
}

function BigSparkline({ points }: { points: number[] }) {
  const width = 720
  const height = 200
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const pts = points.map((p, i) => ({
    x: i * step,
    y: height - ((p - min) / range) * (height - 24) - 12,
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={(height / 4) * (i + 1)}
          y2={(height / 4) * (i + 1)}
          stroke="oklch(30% 0.01 260)"
          strokeWidth={0.5}
          strokeDasharray="2 5"
        />
      ))}
      <path d={areaPath} fill="color-mix(in oklab, var(--accent) 16%, transparent)" />
      <path d={linePath} stroke="var(--accent)" strokeWidth={1.4} fill="none" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4 : 2} fill="var(--accent)" opacity={i === pts.length - 1 ? 1 : 0.65} />
      ))}
    </svg>
  )
}

function SignalBars({ signals }: { signals: { label: string; strength: number }[] }) {
  const maxAbs = 100
  return (
    <ul className="flex flex-col gap-2.5 text-[12px]">
      {signals.map((s) => (
        <li key={s.label} className="grid grid-cols-[90px_1fr_50px] items-center gap-3">
          <span className="text-muted capitalize">{s.label}</span>
          <div className="relative h-2 rounded-full bg-elev-2 overflow-hidden">
            <span
              className={cn('absolute top-0 h-full rounded-full', s.strength >= 0 ? 'left-1/2 bg-[color:var(--accent)]' : 'right-1/2 bg-[color:var(--danger)]')}
              style={{ width: `${(Math.abs(s.strength) / maxAbs) * 50}%` }}
            />
            <span className="absolute left-1/2 top-0 h-full w-px bg-[color:var(--border-strong)]" />
          </div>
          <span className={cn('font-mono text-[11px] text-right', s.strength >= 0 ? 'text-[color:var(--accent)]' : 'text-[color:var(--danger)]')}>
            {s.strength >= 0 ? '+' : ''}{s.strength}
          </span>
        </li>
      ))}
    </ul>
  )
}

function Metric({
  label,
  value,
  sub,
  money,
  pct,
  numeric,
  max,
  accent,
}: {
  label: string
  value: number
  sub?: string
  money?: boolean
  pct?: boolean
  numeric?: boolean
  max?: number
  accent?: boolean
}) {
  const animated = useCountUp(value, 520)
  const formatted = money
    ? fmtLakh(animated)
    : pct
      ? `${Math.round(animated)}%`
      : numeric
        ? Math.round(animated).toLocaleString('en-IN')
        : max
          ? `${Math.round(animated)}${max ? ` / ${max}` : ''}`
          : Math.round(animated).toString()
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1 p-4 flex flex-col gap-1.5">
      <span className="text-[10.5px] uppercase tracking-[0.18em] text-subtle font-medium font-mono">{label}</span>
      <span className={cn('text-[22px] font-semibold tracking-tight font-mono tabular-nums', accent ? 'text-[color:var(--accent)]' : 'text-text')}>
        {formatted}
      </span>
      {sub ? <span className="text-[11px] text-subtle">{sub}</span> : null}
    </div>
  )
}

/**
 * Quiet count-up. Eases from 0 to `target` over `duration`ms once on mount
 * and again whenever target changes. No bouncing, no sparkle.
 */
function useCountUp(target: number, duration = 500): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = 0
    const to = target
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setValue(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

function PersonaBar({ mix }: { mix: Partial<Record<Persona, number>> }) {
  const order: Persona[] = ['UHNI', 'HNI', 'Corporate', 'Family', 'Mixed']
  const active = order.filter((k) => (mix[k] ?? 0) > 0)
  const colours: Record<Persona, string> = {
    UHNI: 'var(--accent)',
    HNI: 'color-mix(in oklab, var(--accent) 65%, transparent)',
    Corporate: 'var(--trace)',
    Family: 'color-mix(in oklab, var(--trace) 55%, transparent)',
    Mixed: 'oklch(52% 0.01 260)',
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-5 rounded overflow-hidden border border-[color:var(--border)]">
        {active.map((k) => (
          <div key={k} style={{ width: `${mix[k]}%`, background: colours[k] }} title={`${k} · ${mix[k]}%`} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
        {active.map((k) => (
          <li key={k} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2 rounded-sm" style={{ background: colours[k] }} />
              {k}
            </span>
            <span className="font-mono text-text">{mix[k]}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HeatCell({ score }: { score: number }) {
  const intensity = score / 100
  const bg = `color-mix(in oklab, var(--accent) ${Math.round(12 + intensity * 78)}%, transparent)`
  return (
    <span
      className="inline-flex items-center justify-center h-8 w-full rounded-[6px] font-mono text-[11px] text-text"
      style={{ background: bg, border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)' }}
    >
      {score}
    </span>
  )
}

function Ratio({ label, value, tone }: { label: string; value: string; tone?: 'accent' }) {
  return (
    <li className="flex items-baseline justify-between gap-3 hairline-b pb-2.5 last:hairline-b-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className={cn('font-mono text-[12.5px]', tone === 'accent' ? 'text-[color:var(--accent)]' : 'text-text')}>
        {value}
      </span>
    </li>
  )
}

function KeyRatios({ rows }: { rows: EventRow[] }) {
  const avgDemand = Math.round(rows.reduce((s, r) => s + r.demand, 0) / rows.length)
  const totalRev = rows.reduce((s, r) => s + r.revenuePotential, 0)
  const avgMargin = Math.round(rows.reduce((s, r) => s + r.margin, 0) / rows.length)
  const avgAttach = Math.round(rows.reduce((s, r) => s + r.attachRate, 0) / rows.length)
  const soldPct = Math.round(
    (rows.reduce((s, r) => s + (r.inventoryHeld - r.inventoryRemaining), 0) / rows.reduce((s, r) => s + r.inventoryHeld, 0)) * 100,
  )
  return (
    <ul className="flex flex-col gap-3 text-[12px]">
      <Ratio label="Avg composite demand" value={String(avgDemand)} tone="accent" />
      <Ratio label="Total revenue potential" value={fmtLakh(totalRev)} />
      <Ratio label="Avg gross margin" value={`${avgMargin}%`} />
      <Ratio label="Avg hospitality attach" value={`${avgAttach}%`} />
      <Ratio label="Inventory sell-through" value={`${soldPct}%`} tone="accent" />
    </ul>
  )
}

// =============================================================================
// Live anomaly ticker — shown under the dialog header
// =============================================================================
function AnomalyTicker() {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setOffset((o) => (o + 1) % anomalies.length), 3800)
    return () => clearInterval(id)
  }, [])
  // Show a run of 3 visible entries starting at offset.
  const visible = useMemo(() => {
    const out: Anomaly[] = []
    for (let i = 0; i < 3; i++) out.push(anomalies[(offset + i) % anomalies.length]!)
    return out
  }, [offset])
  return (
    <div className="shrink-0 hairline-b bg-[oklch(16%_0.012_260)] px-5 h-10 flex items-center gap-4 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative size-2 flex">
          <span className="absolute inset-0 rounded-full bg-[color:var(--accent)]" />
          <span className="absolute inset-0 rounded-full bg-[color:var(--accent)] animate-ping opacity-70" style={{ animationDuration: '1.6s' }} />
        </span>
        <span className="text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--accent)] font-mono font-medium">
          live signals
        </span>
        <span className="text-border">·</span>
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-8 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((a) => (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
              className="flex items-center gap-2.5 text-[11.5px] whitespace-nowrap"
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  a.severity === 'action'
                    ? 'bg-[color:var(--accent)]'
                    : a.severity === 'watch'
                      ? 'bg-[color:var(--trace)]'
                      : 'bg-muted',
                )}
              />
              <span className="text-text font-medium">{a.event}</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{a.signal}</span>
              <span
                className={cn(
                  'font-mono',
                  a.severity === 'action' ? 'text-[color:var(--accent)]' : a.severity === 'watch' ? 'text-[color:var(--trace)]' : 'text-muted',
                )}
              >
                {a.delta}
              </span>
              <span className="text-subtle font-mono text-[10.5px]">· {a.ago}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span className="text-[10px] text-subtle font-mono tracking-[0.14em] shrink-0">
        {anomalies.length} anomalies · last scan 00:23
      </span>
    </div>
  )
}

// =============================================================================
// AI read callout — one strategic insight per section
// =============================================================================
function AIReadCallout({ read }: { read: AIRead }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      className="rounded-[var(--radius-md)] overflow-hidden relative"
      style={{
        background:
          'linear-gradient(135deg, color-mix(in oklab, var(--accent) 14%, transparent), color-mix(in oklab, var(--trace) 8%, transparent))',
        border: '1px solid color-mix(in oklab, var(--accent) 36%, transparent)',
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in oklab, var(--accent) 70%, transparent) 20%, color-mix(in oklab, var(--accent) 70%, transparent) 80%, transparent)',
        }}
      />
      <div className="p-5 flex items-start gap-4">
        <div
          className="shrink-0 size-10 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in oklab, var(--accent) 22%, transparent)',
            border: '1px solid color-mix(in oklab, var(--accent) 48%, transparent)',
          }}
        >
          <Sparkles className="size-4 text-[color:var(--accent)]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)] font-mono font-medium">
              AI read · {read.tag}
            </span>
            <span className="text-[10.5px] font-mono text-subtle">
              confidence <span className="text-[color:var(--accent)]">{read.confidence}</span>
            </span>
          </div>
          <p className="text-[13.5px] text-text leading-[1.65]">{read.insight}</p>
          <div className="mt-3 flex items-center gap-2 text-[10.5px] text-subtle font-mono">
            <span>gemini-3-flash · thinking: medium</span>
            <span className="text-border">·</span>
            <span>signals ingested across 14 sources</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Event selector — horizontal chip row for the deep-dive
// =============================================================================
function EventSelector({ focusedId, onSelect }: { focusedId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="text-[10px] uppercase tracking-[0.22em] text-subtle font-mono font-medium shrink-0 mr-1">
        event ·
      </span>
      {events2026.map((e) => {
        const active = e.id === focusedId
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e.id)}
            className={cn(
              'shrink-0 h-7 px-3 rounded-full border text-[11.5px] font-medium whitespace-nowrap transition-colors',
              active
                ? 'bg-[color:var(--accent)] border-[color:var(--accent)] text-[oklch(16%_0_0)]'
                : 'bg-elev-1 border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]',
            )}
          >
            {e.name.split('·')[0].trim()}
          </button>
        )
      })}
    </div>
  )
}

// =============================================================================
// Provenance rail — bottom of the sidebar
// =============================================================================
function ProvenanceRail() {
  return (
    <div className="shrink-0 hairline-t px-3 py-3 flex flex-col gap-2 bg-[oklch(16%_0.012_260)]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-subtle font-mono font-medium">
          agents · live
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[color:var(--trace)]" style={{ animation: 'pulseGlow 2s ease-in-out infinite' }} />
          <span className="text-[9.5px] text-subtle font-mono">8 online</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
        {provenanceFeed.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-[10.5px] leading-tight">
            <span className="text-[color:var(--trace)] shrink-0 mt-[2px]">
              <span className="size-1 rounded-full bg-current inline-block" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-text truncate">{p.agent}</span>
                <span className="font-mono text-subtle shrink-0">{p.ago}</span>
              </div>
              <div className="text-subtle truncate">{p.action}</div>
            </div>
            {p.conf != null ? (
              <span className="font-mono text-[9.5px] text-[color:var(--accent)] shrink-0">{p.conf}</span>
            ) : null}
          </li>
        ))}
      </ul>
      <style>{`@keyframes pulseGlow { 0%,100% { opacity: 0.45 } 50% { opacity: 1 } }`}</style>
    </div>
  )
}

// =============================================================================
// Command palette — ⌘K
// =============================================================================
interface PaletteItem {
  label: string
  hint: string
  sectionId: string
  eventId?: string
  kind: 'section' | 'event' | 'action'
}
function CommandPalette({
  open,
  onOpenChange,
  onJump,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onJump: (sectionId: string, eventId?: string) => void
}) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!open) {
      setQ('')
      setSelected(0)
    }
  }, [open])

  const items: PaletteItem[] = useMemo(() => {
    const out: PaletteItem[] = []
    for (const s of SECTIONS) {
      out.push({ label: s.label, hint: s.sub, sectionId: s.id, kind: 'section' })
    }
    for (const e of events2026) {
      out.push({
        label: e.name,
        hint: `${e.city} · ${e.start} · demand ${e.demand}`,
        sectionId: 'deep',
        eventId: e.id,
        kind: 'event',
      })
    }
    out.push({ label: 'Run anomaly scan', hint: 'rescan 14 signal sources · ~6s', sectionId: 'pulse', kind: 'action' })
    out.push({ label: 'Export Q2 campaign brief', hint: 'PDF · 6 campaigns', sectionId: 'campaign', kind: 'action' })
    out.push({ label: 'Compare Wimbledon vs Masters', hint: 'portfolio what-if', sectionId: 'campaign', kind: 'action' })
    out.push({ label: 'Open world reach map', hint: 'global pins by venue', sectionId: 'world', kind: 'action' })
    return out
  }, [])

  const filtered = useMemo(() => {
    if (!q) return items
    const needle = q.toLowerCase()
    return items.filter((it) => it.label.toLowerCase().includes(needle) || it.hint.toLowerCase().includes(needle))
  }, [items, q])

  useEffect(() => {
    if (selected >= filtered.length) setSelected(Math.max(0, filtered.length - 1))
  }, [filtered, selected])

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(filtered.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = filtered[selected]
      if (pick) onJump(pick.sectionId, pick.eventId)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[oklch(0%_0_0/0.45)] backdrop-blur-[1.5px]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed z-[80] left-1/2 top-[18%] -translate-x-1/2 w-[580px] max-w-[94vw] rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-elev-1 shadow-[var(--shadow-lift)] overflow-hidden outline-none"
          onKeyDown={onKey}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2.5 px-4 h-12 hairline-b">
            <Search className="size-4 text-subtle" strokeWidth={1.5} />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setSelected(0)
              }}
              placeholder="Jump to event, section, or action…"
              className="flex-1 bg-transparent outline-none text-[13px] text-text placeholder:text-subtle"
            />
            <kbd className="font-mono text-[10px] text-subtle border border-[color:var(--border)] bg-elev-2 rounded px-1.5 py-0.5">esc</kbd>
          </div>
          <ul className="max-h-[380px] overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <li className="px-4 py-6 text-center text-[12px] text-subtle italic">No matches.</li>
            ) : (
              filtered.map((it, i) => {
                const active = i === selected
                return (
                  <li key={`${it.kind}-${it.label}-${i}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setSelected(i)}
                      onClick={() => onJump(it.sectionId, it.eventId)}
                      className={cn(
                        'w-full text-left px-4 py-2 flex items-center gap-3',
                        active ? 'bg-[color:var(--accent-soft)]' : '',
                      )}
                    >
                      <span className={cn('text-[9.5px] font-mono uppercase tracking-[0.14em] w-14 shrink-0', active ? 'text-[color:var(--accent)]' : 'text-subtle')}>
                        {it.kind}
                      </span>
                      <span className="flex-1 min-w-0">
                        <div className={cn('text-[12.5px] truncate', active ? 'text-[color:var(--accent)] font-medium' : 'text-text')}>
                          {it.label}
                        </div>
                        <div className="text-[10.5px] text-subtle truncate">{it.hint}</div>
                      </span>
                      {active ? <CornerDownLeft className="size-3.5 text-[color:var(--accent)] shrink-0" strokeWidth={1.5} /> : null}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
          <div className="hairline-t px-4 py-2 flex items-center justify-between text-[10px] text-subtle font-mono">
            <span>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
            <span>↑↓ navigate · ↵ select · esc close</span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// =============================================================================
// SECTION — Global reach (world map)
// =============================================================================
function WorldReach() {
  const nav = useNav()
  const width = 1000
  const height = 500
  // equirectangular projection
  const project = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  })
  const catColour: Record<Category, string> = {
    F1: 'var(--accent)',
    Tennis: 'color-mix(in oklab, var(--accent) 70%, transparent)',
    Cricket: 'color-mix(in oklab, var(--trace) 90%, transparent)',
    Football: 'color-mix(in oklab, var(--trace) 60%, transparent)',
    Golf: 'oklch(72% 0.11 160)',
    Rugby: 'oklch(68% 0.12 30)',
    Live: 'color-mix(in oklab, var(--accent) 45%, var(--trace) 55%)',
  }
  const regions = [
    { city: 'Mumbai', count: events2026.filter((e) => e.country === 'India').length, rev: events2026.filter((e) => e.country === 'India').reduce((s, e) => s + e.revenuePotential, 0) },
    { city: 'London', count: events2026.filter((e) => e.country === 'United Kingdom').length, rev: events2026.filter((e) => e.country === 'United Kingdom').reduce((s, e) => s + e.revenuePotential, 0) },
    { city: 'Europe', count: events2026.filter((e) => ['France', 'Germany', 'Italy', 'Monaco'].includes(e.country)).length, rev: events2026.filter((e) => ['France', 'Germany', 'Italy', 'Monaco'].includes(e.country)).reduce((s, e) => s + e.revenuePotential, 0) },
    { city: 'US / Augusta', count: events2026.filter((e) => e.country === 'United States').length, rev: events2026.filter((e) => e.country === 'United States').reduce((s, e) => s + e.revenuePotential, 0) },
    { city: 'Middle East', count: events2026.filter((e) => e.country === 'UAE').length, rev: events2026.filter((e) => e.country === 'UAE').reduce((s, e) => s + e.revenuePotential, 0) },
    { city: 'APAC', count: events2026.filter((e) => ['Singapore', 'Australia'].includes(e.country)).length, rev: events2026.filter((e) => ['Singapore', 'Australia'].includes(e.country)).reduce((s, e) => s + e.revenuePotential, 0) },
  ]
  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        kicker="02 · global reach"
        title="Sixteen marquee events. Five continents."
        blurb="Where the 2026 book actually happens. Pin size scales with composite demand; colour indicates category. Click any pin to drop into its deep-dive."
      />

      <Panel title="2026 event map" sub="equirectangular · demand-weighted pins">
        <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[color:var(--border)] bg-[oklch(13%_0.012_260)]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block">
            {/* subtle grid */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v${i}`} x1={(width / 10) * i} y1={0} x2={(width / 10) * i} y2={height} stroke="oklch(22% 0.01 260)" strokeWidth={0.4} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(height / 6) * i} x2={width} y2={(height / 6) * i} stroke="oklch(22% 0.01 260)" strokeWidth={0.4} />
            ))}
            {/* equator */}
            <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="oklch(28% 0.01 260)" strokeWidth={0.7} strokeDasharray="4 6" />
            {/* simplified continent blobs for hint of geography */}
            <g fill="oklch(20% 0.01 260)" opacity={0.75}>
              <path d="M 190 120 Q 280 100 360 130 Q 430 180 360 220 Q 280 230 220 210 Q 170 180 190 120 Z" />
              <path d="M 440 140 Q 520 110 600 140 Q 620 220 520 240 Q 460 220 440 180 Z" />
              <path d="M 530 260 Q 600 250 640 310 Q 620 390 560 410 Q 500 380 500 320 Z" />
              <path d="M 620 180 Q 740 160 840 210 Q 880 280 820 340 Q 720 370 650 320 Q 600 260 620 180 Z" />
              <path d="M 250 280 Q 330 270 360 320 Q 340 390 280 400 Q 220 370 230 320 Z" />
              <path d="M 820 360 Q 880 350 900 400 Q 870 430 830 420 Z" />
            </g>

            {/* pins */}
            {events2026.map((e) => {
              const coord = cityCoords[e.city]
              if (!coord) return null
              const { x, y } = project(coord.lat, coord.lng)
              const r = 5 + (e.demand / 100) * 10
              return (
                <g
                  key={e.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    nav.focusEvent(e.id)
                    nav.goToSection('deep')
                  }}
                >
                  <circle cx={x} cy={y} r={r + 6} fill={catColour[e.category]} opacity={0.15} />
                  <circle cx={x} cy={y} r={r} fill={catColour[e.category]} opacity={0.85} />
                  <circle cx={x} cy={y} r={1.5} fill="oklch(98% 0 0)" />
                  <text x={x + r + 6} y={y + 3} fontSize="9.5" fill="oklch(72% 0.01 260)" fontFamily="Geist Mono, ui-monospace, monospace">
                    {e.name.split('·')[0].split('(')[0].trim().slice(0, 18)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </Panel>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        <Panel title="Regional book" sub="2026 revenue potential by region">
          <ul className="flex flex-col gap-2.5 text-[12px]">
            {regions.sort((a, b) => b.rev - a.rev).map((r) => (
              <li key={r.city} className="grid grid-cols-[120px_1fr_70px_60px] items-center gap-3">
                <span className="text-text">{r.city}</span>
                <div className="h-1.5 rounded-full bg-elev-2 overflow-hidden">
                  <span className="block h-full bg-[color:var(--accent)]" style={{ width: `${Math.min(100, r.rev / 800_000)}%` }} />
                </div>
                <span className="font-mono text-[11px] text-text text-right">{fmtLakh(r.rev)}</span>
                <span className="font-mono text-[11px] text-subtle text-right">{r.count}ev</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Category legend" sub="pin colour encodes category">
          <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px]">
            {categoryOrder.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: catColour[c] }} />
                <span className="text-muted">{c}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11.5px] text-subtle leading-relaxed mt-4">
            Pin size encodes composite demand (0-100). Halos indicate attention intensity. Click any pin to drop directly
            into the event deep dive — the whole command centre is drill-addressable.
          </p>
        </Panel>
      </div>
    </div>
  )
}

// =============================================================================
// Scenario simulator — shown inside the Event Deep Dive
// =============================================================================
function ScenarioSimulator({ event }: { event: EventRow }) {
  const [priceDelta, setPriceDelta] = useState(0) // -20 .. +20 %
  const [attachLift, setAttachLift] = useState(0) // -15 .. +15 pts
  const [releaseShare, setReleaseShare] = useState(60) // % of remaining to release

  // Project: seats sellable = inventoryRemaining * (releaseShare/100) * (1 - priceDelta/100 * elasticity)
  const elasticity = 0.8
  const seats = Math.round(event.inventoryRemaining * (releaseShare / 100) * (1 - (priceDelta / 100) * elasticity))
  const aovProjected = Math.round(event.aov * (1 + priceDelta / 100))
  const attachProjected = Math.max(0, Math.min(100, event.attachRate + attachLift))
  const revenueProjected = Math.max(0, seats * aovProjected * (1 + attachProjected / 400))
  const marginProjected = Math.max(5, Math.min(55, event.margin + priceDelta * 0.4 + attachLift * 0.15))

  return (
    <Panel title="Scenario simulator" sub="adjust the levers, watch projections update">
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <SliderRow label="Price ladder" value={priceDelta} min={-20} max={20} unit="%" onChange={setPriceDelta} />
          <SliderRow label="Hospitality attach lift" value={attachLift} min={-15} max={15} unit="pts" onChange={setAttachLift} />
          <SliderRow label="Inventory release" value={releaseShare} min={0} max={100} unit="%" onChange={setReleaseShare} />
        </div>
        <div className="flex flex-col gap-3">
          <ProjectionRow label="Seats sold · projection" value={String(seats)} />
          <ProjectionRow label="AOV · per guest" value={fmtLakh(aovProjected)} />
          <ProjectionRow label="Attach · hospitality" value={`${attachProjected}%`} />
          <div className="hairline-t pt-3 mt-1">
            <ProjectionRow label="Projected revenue" value={fmtLakh(revenueProjected)} accent />
            <ProjectionRow label="Projected margin" value={`${Math.round(marginProjected)}%`} />
          </div>
          <p className="text-[10.5px] text-subtle font-mono leading-relaxed mt-1">
            elasticity = {elasticity.toFixed(1)} · baseline from current book
          </p>
        </div>
      </div>
    </Panel>
  )
}

function SliderRow({
  label, value, min, max, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-text">
          {value >= 0 && unit !== '%' && min < 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--accent)]"
      />
      <div className="flex justify-between text-[10px] text-subtle font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function ProjectionRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 hairline-b last:hairline-b-0">
      <span className="text-[12px] text-muted">{label}</span>
      <span className={cn('font-mono text-[12.5px] tabular-nums', accent ? 'text-[color:var(--accent)]' : 'text-text')}>
        {value}
      </span>
    </div>
  )
}

// Suppress unused
void TRACE
void ACCENT
