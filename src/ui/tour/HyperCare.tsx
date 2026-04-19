/**
 * Hyper Care — the post-sales journey, on your phone.
 *
 * Twelve moments, T-45 days through the return home. The agent does not
 * stop at the booking; it stays alongside. Each beat surfaces as a
 * quietly-considered notification on an iPhone lock-screen. A commentary
 * panel on the right explains what the agent is reading and why the
 * moment matters.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { HeartHandshake, Pause, Play, RotateCcw, X, Wifi, Signal, BatteryMedium } from 'lucide-react'

// -----------------------------------------------------------------------------
// Beats — twelve moments across the post-sales journey
// -----------------------------------------------------------------------------
interface Beat {
  id: string
  day: number // negative = before, positive = during/after
  phase: string
  category: string
  title: string
  body: string
  cta?: string
  commentary: string
  time: string
  date: string
}

const BEATS: Beat[] = [
  {
    id: 'visa',
    day: -45,
    phase: 'T-45 days',
    category: 'Travel documents',
    title: 'UK visa window opens tomorrow',
    body:
      'Wimbledon is in 45 days. I can submit your documents at 09:00 — passport scans are already on file. One authorisation and it is done.',
    cta: 'Authorise submission',
    commentary:
      'Forty-five days out, the agent is already reading the per-country visa window. You are not chasing a deadline — it chases you, politely.',
    time: '10:24',
    date: 'Wed, 15 May',
  },
  {
    id: 'attire',
    day: -30,
    phase: 'T-30 days',
    category: 'Attire · dress code',
    title: 'A quick note on the dress code',
    body:
      'Centre Court is players-in-white; stands are smart casual. Tea in the debenture pavilion is jacket-preferred. I have drafted a style note for the fortnight.',
    cta: 'Open the style note',
    commentary:
      'Dress codes change by venue, session, and occasion. The agent reads the protocol and prepares — never a surprise at the gate.',
    time: '18:02',
    date: 'Sun, 30 May',
  },
  {
    id: 'packing',
    day: -20,
    phase: 'T-20 days',
    category: 'Packing · weather-aware',
    title: 'London · 22° / 13°, light rain forecast',
    body:
      'The Connaught does not stock umbrellas in-room. A light shell, two neutral layers, and a compact fold-out would cover the fortnight. Shall I draft the list?',
    cta: 'Draft packing list',
    commentary:
      'Weather ingestion runs three days ahead of the packing beat. Recommendations are hotel-specific — it knows what the Connaught provides and what you need to carry.',
    time: '07:42',
    date: 'Tue, 9 Jun',
  },
  {
    id: 'daytour',
    day: -15,
    phase: 'T-15 days',
    category: 'Day experiences',
    title: 'A quiet V&A morning — would you like to hold it?',
    body:
      'Tuesday 7 Jul is the rest day between matches. Ninety-minute private V&A tour for the children at 10:00; guide Felix (you liked him in 2024) is available.',
    cta: 'Hold the tour',
    commentary:
      'The agent reads the rest-day shape and offers culturally-paced fillers — not pushy, always relevant. It remembers which guide worked for you last time.',
    time: '16:30',
    date: 'Fri, 14 Jun',
  },
  {
    id: 'dining',
    day: -10,
    phase: 'T-10 days',
    category: 'Dining',
    title: 'Core by Clare Smyth holds a table',
    body:
      'Saturday 5 Jul · 21:30 for six. Your partner\'s vegan preference and the two gluten-free notes are on the booking. One tap to confirm.',
    cta: 'Confirm dinner',
    commentary:
      'Michelin reservations follow the itinerary automatically. Dietary preferences from long-term memory ride along — nothing needs repeating.',
    time: '11:18',
    date: 'Wed, 19 Jun',
  },
  {
    id: 'fx',
    day: -7,
    phase: 'T-7 days',
    category: 'Currency · FX',
    title: '£2,400 forex card — home delivery?',
    body:
      'At today\'s rate, ₹2.56L. Same-day courier to your Bandra address; confirmation by 18:00. Card is pre-activated for UK spend.',
    cta: 'Schedule delivery',
    commentary:
      'FX loadings are sized against your prior trip pattern. Home delivery is timed to skip the last-minute airport queue.',
    time: '09:55',
    date: 'Sat, 22 Jun',
  },
  {
    id: 'checkin',
    day: -3,
    phase: 'T-3 days',
    category: 'Web check-in',
    title: 'BA 138 check-in opens at 14:00',
    body:
      'Same-bay seats held for the six of you — 3K onwards. Bassinet confirmed. I will complete check-in the moment the window opens, unless you prefer to do it.',
    cta: 'Let me handle it',
    commentary:
      'Check-in windows are monitored per carrier. The agent finishes within seconds of opening — ahead of the bot traffic — to hold adjacent seats.',
    time: '08:10',
    date: 'Wed, 26 Jun',
  },
  {
    id: 'pickup',
    day: -2,
    phase: 'T-2 days',
    category: 'Ground transport',
    title: 'Airport pickup tomorrow?',
    body:
      'Mercedes V-Class for six, 05:00 from home to T2. Driver is Ramesh — you gave him 4.9 in January. Same default if that works.',
    cta: 'Book V-Class',
    commentary:
      'Same vehicle class, same driver when available. The agent does not ask you to pick; it offers the known-good default.',
    time: '17:40',
    date: 'Thu, 27 Jun',
  },
  {
    id: 'dropoff',
    day: -1,
    phase: 'T-1 day',
    category: 'Ground transport',
    title: 'Return drop planned — 12 Jul, 06:30',
    body:
      'Boarding BA 137 at 09:15 from Heathrow T5. Connaught to T5 with the V-Class and Ramesh again. Confirm and it is locked.',
    cta: 'Confirm return',
    commentary:
      'The return leg is sequenced T-1 so nothing slips between the departure and the matches. Same carrier-side, same driver.',
    time: '19:18',
    date: 'Fri, 28 Jun',
  },
  {
    id: 'arrival',
    day: 1,
    phase: 'On arrival · day one',
    category: 'Local intel',
    title: 'London, now — four small things',
    body:
      'St John Bread & Wine for the doughnuts (walk from the hotel). Ben\'s Cookies reopened in Marylebone. Skip Borough on a Saturday. Harrods Food Hall is quiet before 11.',
    commentary:
      'The first morning is about signals that do not fit any booking. The agent feeds the family intel it would whisper if it were your London friend.',
    time: '08:06',
    date: 'Sat, 29 Jun',
  },
  {
    id: 'event',
    day: 6,
    phase: 'Event day',
    category: 'In-trip care',
    title: 'Ground-side at Gate 5 · everything alright?',
    body:
      'Weather is holding. Queue is moving. If you need a hand — strollers, water, medical, a quieter seat — I can flag an on-ground host in 90 seconds.',
    cta: 'Ping the host',
    commentary:
      'During the event, the agent is a silent presence. Never pushing anything — always one tap from being useful.',
    time: '12:58',
    date: 'Thu, 4 Jul',
  },
  {
    id: 'memory',
    day: 14,
    phase: 'Post-event · memory',
    category: 'Memories',
    title: 'A quiet dossier of the fortnight',
    body:
      '42 photos curated from your camera roll across the trip, captioned where it matters, private link for the six of you. No marketing. Yours to keep or share.',
    cta: 'Preview the album',
    commentary:
      'The post-trip memory object is the quiet close. Not a testimonial ask. Just the thing to remember it by — the kind of gesture you remember next year.',
    time: '20:14',
    date: 'Mon, 15 Jul',
  },
]

const BEAT_DURATION = 5.2 // seconds
const TOTAL = BEATS.length * BEAT_DURATION

// -----------------------------------------------------------------------------
// Button
// -----------------------------------------------------------------------------
export function HyperCareButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[color:var(--border)] bg-elev-1 text-muted hover:text-text hover:border-[color:var(--border-strong)] transition-colors text-[11px] font-medium"
        title="Hyper Care — the post-sales journey"
      >
        <HeartHandshake className="size-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">hyper care</span>
      </button>
      <HyperCare open={open} onOpenChange={setOpen} />
    </>
  )
}

// -----------------------------------------------------------------------------
// Dialog
// -----------------------------------------------------------------------------
function HyperCare({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [runId, setRunId] = useState(0)
  const rafRef = useRef<number>(0)
  const lastTick = useRef<number>(0)

  useEffect(() => {
    if (!open) {
      setElapsed(0)
      setPlaying(true)
    }
  }, [open])

  useEffect(() => {
    if (!open || !playing) return
    lastTick.current = performance.now()
    const tick = (now: number) => {
      const dt = (now - lastTick.current) / 1000
      lastTick.current = now
      setElapsed((e) => (e + dt >= TOTAL ? TOTAL : e + dt))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, playing, runId])

  useEffect(() => {
    if (elapsed >= TOTAL) setPlaying(false)
  }, [elapsed])

  const beatIdx = Math.min(BEATS.length - 1, Math.floor(elapsed / BEAT_DURATION))
  const currentBeat = BEATS[beatIdx]!

  const restart = () => {
    setElapsed(0)
    setPlaying(true)
    setRunId((r) => r + 1)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/90 data-[state=open]:animate-[fadeIn_200ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col outline-none bg-[oklch(10%_0.01_260)] overflow-hidden"
        >
          <Dialog.Title className="sr-only">Hyper Care — post-sales journey</Dialog.Title>

          {/* Ambient background glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(1000px 600px at 30% 50%, oklch(20% 0.08 55 / 0.35), transparent 70%)',
            }}
          />

          {/* Header */}
          <header className="shrink-0 relative z-10 flex items-center justify-between h-14 px-6 hairline-b">
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-medium text-text">Hyper Care</span>
              <span className="text-[11px] text-subtle font-mono">
                POST-SALES JOURNEY · TWELVE MOMENTS · MOBILE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="size-9 rounded-full flex items-center justify-center bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="size-3.5" strokeWidth={1.8} /> : <Play className="size-3.5" strokeWidth={1.8} />}
              </button>
              <button
                type="button"
                onClick={restart}
                className="size-9 rounded-full flex items-center justify-center bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]"
                title="Restart"
              >
                <RotateCcw className="size-3.5" strokeWidth={1.8} />
              </button>
              <Dialog.Close asChild>
                <button className="size-9 rounded-full flex items-center justify-center bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text">
                  <X className="size-3.5" strokeWidth={1.8} />
                </button>
              </Dialog.Close>
            </div>
          </header>

          {/* Stage */}
          <div className="relative z-10 flex-1 min-h-0 grid grid-cols-[minmax(420px,1fr)_minmax(420px,1.1fr)] items-center">
            <div className="flex items-center justify-center p-8">
              <Phone key={runId} beatIdx={beatIdx} currentBeat={currentBeat} />
            </div>
            <div className="p-10 pr-16 max-w-[680px]">
              <Commentary beat={currentBeat} idx={beatIdx} />
            </div>
          </div>

          {/* Timeline */}
          <footer className="relative z-10 shrink-0 px-6 pb-6 pt-3">
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-subtle font-mono numeric">
                {fmt(elapsed)} / {fmt(TOTAL)}
              </span>
              <div className="relative flex-1 h-1 rounded-full bg-[oklch(22%_0.01_260)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(elapsed / TOTAL) * 100}%`,
                    background: 'linear-gradient(90deg, oklch(72% 0.09 200), oklch(80% 0.13 85))',
                  }}
                />
                {BEATS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setElapsed(i * BEAT_DURATION + 0.2)
                      setPlaying(false)
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full pointer-events-auto"
                    style={{
                      left: `${((i * BEAT_DURATION) / TOTAL) * 100}%`,
                      background: elapsed >= i * BEAT_DURATION ? 'oklch(80% 0.13 85)' : 'oklch(34% 0.01 260)',
                    }}
                    title={`${b.phase} · ${b.title}`}
                  />
                ))}
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-subtle font-mono">
                {currentBeat.phase}
              </span>
            </div>
          </footer>

          <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function fmt(s: number): string {
  const whole = Math.floor(s)
  const tenths = Math.floor((s - whole) * 10)
  return `${String(whole).padStart(2, '0')}.${tenths}s`
}

// -----------------------------------------------------------------------------
// Commentary panel
// -----------------------------------------------------------------------------
function Commentary({ beat, idx }: { beat: Beat; idx: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={beat.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
        className="flex flex-col gap-5"
      >
        <div className="text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--accent)] font-medium font-mono">
          moment {String(idx + 1).padStart(2, '0')} · of {BEATS.length}
        </div>
        <div
          className="text-[44px] md:text-[52px] leading-[1.02] font-semibold tracking-[-0.02em] text-text"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {beat.phase}
        </div>
        <div className="text-[12px] uppercase tracking-[0.22em] text-subtle font-mono">
          {beat.category}
        </div>
        <p className="text-[14.5px] text-muted leading-[1.7] max-w-[540px]">{beat.commentary}</p>
        <div className="hairline-t pt-5 flex flex-col gap-2 max-w-[540px]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-subtle font-mono font-medium">
            what arrives
          </span>
          <div className="text-[15px] text-text font-medium">{beat.title}</div>
          <div className="text-[13px] text-muted leading-relaxed">{beat.body}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// -----------------------------------------------------------------------------
// iPhone
// -----------------------------------------------------------------------------
function Phone({ beatIdx, currentBeat }: { beatIdx: number; currentBeat: Beat }) {
  // Notifications: newest at top. Take up to the 5 most recent.
  const stack = useMemo(
    () =>
      BEATS.slice(0, beatIdx + 1)
        .slice()
        .reverse()
        .slice(0, 5),
    [beatIdx],
  )

  return (
    <div className="relative" style={{ width: 360, height: 740 }}>
      {/* Outer titanium frame */}
      <div
        className="absolute inset-0 rounded-[56px]"
        style={{
          background:
            'linear-gradient(145deg, oklch(32% 0.014 80), oklch(18% 0.010 260) 55%, oklch(24% 0.012 90))',
          boxShadow:
            '0 60px 100px -30px rgba(0,0,0,0.8), 0 0 0 1px oklch(100% 0 0 / 0.04) inset, 0 2px 0 oklch(100% 0 0 / 0.06) inset',
        }}
      />
      {/* Side button hint */}
      <div
        className="absolute right-[-3px] top-[190px] w-[3px] h-[78px] rounded-r"
        style={{ background: 'oklch(42% 0.014 80)' }}
      />
      <div
        className="absolute left-[-3px] top-[160px] w-[3px] h-[36px] rounded-l"
        style={{ background: 'oklch(42% 0.014 80)' }}
      />
      <div
        className="absolute left-[-3px] top-[216px] w-[3px] h-[64px] rounded-l"
        style={{ background: 'oklch(42% 0.014 80)' }}
      />
      <div
        className="absolute left-[-3px] top-[288px] w-[3px] h-[64px] rounded-l"
        style={{ background: 'oklch(42% 0.014 80)' }}
      />

      {/* Screen */}
      <div
        className="absolute rounded-[46px] overflow-hidden"
        style={{
          inset: 7,
          background: `
            radial-gradient(circle at 25% 20%, oklch(28% 0.08 60 / 0.45), transparent 55%),
            linear-gradient(165deg, oklch(18% 0.08 50), oklch(10% 0.01 260) 60%)
          `,
        }}
      >
        {/* Grain */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />

        {/* Dynamic island */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black"
          style={{ top: 10, width: 122, height: 34 }}
        />

        {/* Status bar */}
        <div className="absolute top-[16px] left-[32px] text-white/95 text-[15px] font-semibold" style={{ fontFamily: "'SF Pro Display', -apple-system, Inter, sans-serif" }}>
          {currentBeat.time}
        </div>
        <div className="absolute top-[19px] right-[30px] flex items-center gap-1 text-white/95">
          <Signal className="size-[13px]" strokeWidth={2.4} />
          <Wifi className="size-[13px]" strokeWidth={2.4} />
          <BatteryMedium className="size-[16px]" strokeWidth={2} />
        </div>

        {/* Lock screen clock + date */}
        <div className="absolute left-0 right-0 top-[70px] text-center">
          <motion.div
            key={`date-${currentBeat.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-white/80 text-[13.5px] font-medium"
          >
            {currentBeat.date}
          </motion.div>
          <motion.div
            key={`time-${currentBeat.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-white font-light leading-none mt-2 tracking-[-0.04em]"
            style={{ fontFamily: "'SF Pro Display', -apple-system, Inter, sans-serif", fontSize: 86 }}
          >
            {currentBeat.time}
          </motion.div>
        </div>

        {/* Notification stack */}
        <div className="absolute left-[14px] right-[14px] top-[228px] flex flex-col gap-[10px]">
          <AnimatePresence initial={false}>
            {stack.map((b, i) => (
              <NotificationCard key={b.id} beat={b} index={i} isNew={i === 0 && b.id === currentBeat.id} />
            ))}
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ bottom: 8, width: 132, height: 5, background: 'oklch(98% 0 0 / 0.72)' }}
        />
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Notification card — iOS-accurate with frosted background
// -----------------------------------------------------------------------------
function NotificationCard({ beat, index, isNew }: { beat: Beat; index: number; isNew: boolean }) {
  const baseOpacity = index === 0 ? 1 : Math.max(0.45, 1 - index * 0.15)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -36, scale: 0.94 }}
      animate={{
        opacity: baseOpacity,
        y: 0,
        scale: 1 - index * 0.02,
        transition: { type: 'spring', stiffness: 260, damping: 26 },
      }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="relative rounded-[20px] overflow-hidden"
      style={{
        background: 'oklch(24% 0.010 260 / 0.78)',
        backdropFilter: 'blur(24px) saturate(140%)',
        WebkitBackdropFilter: 'blur(24px) saturate(140%)',
        boxShadow:
          index === 0
            ? '0 8px 24px -6px rgba(0,0,0,0.55), 0 0 0 1px oklch(100% 0 0 / 0.06) inset'
            : '0 2px 8px -2px rgba(0,0,0,0.45), 0 0 0 1px oklch(100% 0 0 / 0.04) inset',
      }}
    >
      {/* top highlight line when brand new */}
      {isNew ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, oklch(80% 0.13 85 / 0.7), transparent)',
          }}
        />
      ) : null}
      <div className="flex items-start gap-2.5 p-3">
        <AppIcon />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold text-white/95 uppercase tracking-[0.04em]">
              Agent Concierge
            </span>
            <span className="text-[10.5px] text-white/55">{index === 0 ? 'now' : relativeFromIndex(index)}</span>
          </div>
          <div className="text-[13.5px] text-white font-semibold leading-[1.25] mt-[2px]" style={{ fontFamily: "'SF Pro Display', -apple-system, Inter, sans-serif" }}>
            {beat.title}
          </div>
          <div className="text-[12.5px] text-white/80 leading-[1.35] mt-0.5 line-clamp-3">
            {beat.body}
          </div>
          {beat.cta && index === 0 ? (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[11px] text-white/55">Tap to open</span>
              <span className="text-[11.5px] font-medium" style={{ color: 'oklch(80% 0.13 85)' }}>
                {beat.cta} →
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function relativeFromIndex(i: number): string {
  if (i === 1) return 'earlier'
  if (i === 2) return '2h ago'
  if (i === 3) return 'yesterday'
  return 'this week'
}

function AppIcon() {
  return (
    <div
      className="size-9 rounded-[9px] shrink-0 flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, oklch(82% 0.14 82), oklch(58% 0.12 58))',
        boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 0 0.5px oklch(20% 0.02 60) inset',
      }}
    >
      <svg viewBox="0 0 28 28" className="size-6">
        <circle cx="14" cy="14" r="6.5" fill="none" stroke="oklch(14% 0 0)" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="1.6" fill="oklch(14% 0 0)" />
      </svg>
    </div>
  )
}
