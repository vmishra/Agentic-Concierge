/**
 * ImmersiveFlow — a single cinematic that replays the whole system
 * end-to-end in ~45 seconds.
 *
 * A user submits a Wimbledon request; the animation traces the request
 * through every layer of the architecture: skills loading, memory recall,
 * parallel specialist dispatch, tool calls, deep-research iterations,
 * A2UI artifact emission, human-in-the-loop approval, context
 * compaction, final dossier. All layered on a 3D perspective stage
 * so the system unfolds like a Palantir-grade architecture diagram.
 */

import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'motion/react'
import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const ACCENT = 'oklch(80% 0.13 85)'
const TRACE = 'oklch(72% 0.09 200)'
const WHITE = 'oklch(96% 0 0)'
const MUTED = 'oklch(72% 0.01 260)'
const SUBTLE = 'oklch(52% 0.01 260)'

/** Scene timeline, in seconds. Each entry is a labelled act. */
interface Act {
  t: number
  id: string
  label: string
  sub: string
}

const ACTS: Act[] = [
  { t: 0.0, id: 'stage', label: 'the stage', sub: 'an empty system, ready' },
  { t: 2.5, id: 'input', label: 'user submits', sub: '"Wimbledon 2026 · family of six"' },
  { t: 5.5, id: 'concierge', label: 'concierge receives', sub: 'the coordinator agent wakes' },
  { t: 8.0, id: 'skills', label: 'skills attach', sub: 'on-demand context · `skill · load`' },
  { t: 11.5, id: 'memory', label: 'memory recall', sub: 'gemini-embedding-2 · top-k search' },
  { t: 15.0, id: 'fanout', label: 'parallel dispatch', sub: 'five specialists via A2A' },
  { t: 19.0, id: 'tools', label: 'tools fire', sub: 'manifests load · `Promise.all`' },
  { t: 22.5, id: 'research', label: 'deep research', sub: 'plan → search → critique → refine' },
  { t: 26.5, id: 'artifacts', label: 'a2ui artifacts', sub: 'typed components stream back' },
  { t: 30.5, id: 'hitl', label: 'human approval', sub: '`request_approval` · turn paused' },
  { t: 34.5, id: 'compact', label: 'context compaction', sub: '−120k tokens · stay disciplined' },
  { t: 37.5, id: 'dossier', label: 'dossier delivered', sub: 'a single cohesive response' },
  { t: 41.0, id: 'credits', label: 'powered by Google AI', sub: 'ADK · A2A · A2UI · Gemini 3 Flash · gemini-embedding-2' },
]

const TOTAL = 44

export function ImmersiveFlow({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [playing, setPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [runId, setRunId] = useState(0)
  const rafRef = useRef<number>(0)
  const lastTick = useRef<number>(0)

  useEffect(() => {
    if (!open) {
      setElapsed(0)
      setPlaying(true)
      setRunId((r) => r + 1)
    }
  }, [open])

  useEffect(() => {
    if (!open || !playing) return
    lastTick.current = performance.now()
    const tick = (now: number) => {
      const dt = (now - lastTick.current) / 1000
      lastTick.current = now
      setElapsed((e) => {
        const next = e + dt
        return next >= TOTAL ? TOTAL : next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [open, playing, runId])

  useEffect(() => {
    if (elapsed >= TOTAL) setPlaying(false)
  }, [elapsed])

  // Determine the current act.
  const activeAct = (() => {
    let cur = ACTS[0]!
    for (const a of ACTS) if (elapsed >= a.t) cur = a
    return cur
  })()

  const restart = () => {
    setElapsed(0)
    setPlaying(true)
    setRunId((r) => r + 1)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black data-[state=open]:animate-[fadeIn_300ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col outline-none bg-[oklch(8%_0.008_260)] overflow-hidden"
        >
          <Dialog.Title className="sr-only">Immersive system flow</Dialog.Title>

          {/* Starfield + grid floor */}
          <BackgroundScene />

          {/* Main scene */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center">
            <Scene key={runId} elapsed={elapsed} />
          </div>

          {/* Act label overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAct.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }}
              className="absolute left-10 top-10 pointer-events-none"
            >
              <div className="text-[10.5px] uppercase tracking-[0.32em] text-[color:var(--accent)] font-medium mb-3 font-mono">
                act {String(ACTS.indexOf(activeAct) + 1).padStart(2, '0')} · of {ACTS.length}
              </div>
              <div
                className="text-[38px] md:text-[46px] leading-[1.1] font-semibold tracking-[-0.015em] text-text max-w-[680px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {activeAct.label}
              </div>
              <div className="mt-3 text-[13.5px] text-muted font-mono tracking-[-0.005em]">{activeAct.sub}</div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute right-10 top-10 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className={cn(
                'size-10 rounded-full flex items-center justify-center',
                'bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]',
              )}
              aria-label={playing ? 'Pause' : 'Play'}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="size-4" strokeWidth={1.8} /> : <Play className="size-4" strokeWidth={1.8} />}
            </button>
            <button
              type="button"
              onClick={restart}
              className="size-10 rounded-full flex items-center justify-center bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]"
              aria-label="Restart"
              title="Restart"
            >
              <RotateCcw className="size-4" strokeWidth={1.8} />
            </button>
            <Dialog.Close asChild>
              <button
                type="button"
                className="size-10 rounded-full flex items-center justify-center bg-elev-1 border border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]"
                aria-label="Close"
                title="Close"
              >
                <X className="size-4" strokeWidth={1.8} />
              </button>
            </Dialog.Close>
          </div>

          {/* Timeline */}
          <div className="absolute inset-x-0 bottom-0 px-10 pb-8">
            <div className="flex items-center gap-4">
              <span className="text-[11px] numeric text-subtle font-mono">
                {fmtTime(elapsed)} / {fmtTime(TOTAL)}
              </span>
              <div className="relative flex-1 h-1 rounded-full bg-[oklch(22%_0.01_260)] overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(100, (elapsed / TOTAL) * 100)}%`,
                    background: `linear-gradient(90deg, ${TRACE}, ${ACCENT})`,
                  }}
                />
                {ACTS.map((a) => (
                  <span
                    key={a.id}
                    className="absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full pointer-events-none"
                    style={{
                      left: `${(a.t / TOTAL) * 100}%`,
                      background: elapsed >= a.t ? ACCENT : 'oklch(34% 0.01 260)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] tracking-[0.22em] uppercase text-subtle font-medium">
                {activeAct.id}
              </span>
            </div>
          </div>

          <style>{`
            @keyframes starTwinkle { 0%,100% { opacity: 0.25 } 50% { opacity: 0.9 } }
            @keyframes flowDashFast { to { stroke-dashoffset: -60 } }
            @keyframes pulseGlow { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
          `}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function fmtTime(s: number): string {
  const whole = Math.floor(s)
  const tenths = Math.floor((s - whole) * 10)
  return `${String(whole).padStart(2, '0')}.${tenths}s`
}

// -----------------------------------------------------------------------------
// The scene
// -----------------------------------------------------------------------------

function Scene({ elapsed }: { elapsed: number }) {
  // Helper: "visible from" — opacity ramps in over 0.6s after t0.
  const vis = (t0: number, dur = 0.6) => clamp((elapsed - t0) / dur, 0, 1)
  // "active between" t0..t1 — used for highlighted effects.
  const between = (t0: number, t1: number) => (elapsed >= t0 && elapsed <= t1 ? 1 : 0)

  return (
    <div
      className="relative w-full h-full"
      style={{ perspective: '1600px', perspectiveOrigin: '50% 40%' }}
    >
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        {/* Ground plane grid — conveys depth */}
        <GroundGrid />

        {/* Central 'stage' svg containing all nodes */}
        <svg
          viewBox="0 0 1200 720"
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'translateZ(0)' }}
        >
          <defs>
            <filter id="iGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="iStrong" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="hub" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.9" />
              <stop offset="60%" stopColor={ACCENT} stopOpacity="0.2" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </radialGradient>
            <marker id="iAr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
            </marker>
          </defs>

          {/* ---------- user ingress ---------- */}
          <UserNode show={vis(2)} pulse={between(2, 5)} />
          <IngressBeam from={{ x: 120, y: 560 }} to={{ x: 600, y: 360 }} show={vis(3.0, 1.2)} flow={between(3, 6)} />

          {/* ---------- Concierge hub ---------- */}
          <ConciergeHub show={vis(5)} pulse={between(5, TOTAL)} />

          {/* ---------- Skills layer ---------- */}
          <SkillsLayer show={vis(8)} active={between(8, 12)} />

          {/* ---------- Memory pillar ---------- */}
          <MemoryLayer show={vis(11.5)} active={between(11.5, 15)} />

          {/* ---------- Specialist fan-out ---------- */}
          <SpecialistRing show={vis(15)} active={between(15, TOTAL)} elapsed={elapsed} />

          {/* ---------- Tool orbits ---------- */}
          <ToolOrbit show={vis(19)} active={between(19, 23)} elapsed={elapsed} />

          {/* ---------- Research loop ---------- */}
          <ResearchLoop show={vis(22.5)} elapsed={elapsed} />

          {/* ---------- A2UI artifacts streaming ---------- */}
          <ArtifactStream show={vis(26.5)} elapsed={elapsed} />

          {/* ---------- Human-in-the-loop pause ---------- */}
          <HitlGate show={vis(30.5)} elapsed={elapsed} />

          {/* ---------- Context compaction ---------- */}
          <ContextCompact show={vis(34.5)} elapsed={elapsed} />

          {/* ---------- Final dossier ---------- */}
          <Dossier show={vis(37.5)} elapsed={elapsed} />

          {/* ---------- Credits ---------- */}
          <Credits show={vis(41.0)} />
        </svg>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Background: starfield + grid floor
// -----------------------------------------------------------------------------

function BackgroundScene() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(1200px 700px at 50% 48%, oklch(18% 0.014 85 / 0.55), transparent 60%)',
      }}
    />
  )
}

function GroundGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
      style={{
        transform: 'rotateX(64deg) translateY(12%)',
        transformOrigin: '50% 100%',
        background: `
          linear-gradient(to right, oklch(28% 0.01 260 / 0.3) 1px, transparent 1px) 0 0 / 70px 70px,
          linear-gradient(to bottom, oklch(28% 0.01 260 / 0.3) 1px, transparent 1px) 0 0 / 70px 70px,
          radial-gradient(ellipse 60% 100% at 50% 100%, oklch(14% 0.012 260) 40%, transparent 100%)
        `,
        maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
      }}
    />
  )
}

// -----------------------------------------------------------------------------
// Scene parts
// -----------------------------------------------------------------------------

function UserNode({ show, pulse }: { show: number; pulse: number }) {
  return (
    <g style={{ opacity: show }}>
      <rect x={40} y={520} width={180} height={70} rx={10} fill="oklch(18% 0.012 260)" stroke={ACCENT} strokeWidth={1} filter="url(#iGlow)" />
      <text x={58} y={546} fontSize="11" letterSpacing="2.2" fill={SUBTLE}>
        USER
      </text>
      <text x={58} y={568} fontSize="13" fill={WHITE} fontFamily="Geist Mono, ui-monospace, monospace">
        "Wimbledon 2026"
      </text>
      <text x={58} y={584} fontSize="10" fill={MUTED}>
        family of six · 5 nights
      </text>
      {pulse > 0 ? (
        <circle cx={210} cy={556} r={3} fill={ACCENT} style={{ animation: 'pulseGlow 1.4s ease-in-out infinite' }} />
      ) : null}
    </g>
  )
}

function IngressBeam({ from, to, show, flow }: { from: { x: number; y: number }; to: { x: number; y: number }; show: number; flow: number }) {
  return (
    <g style={{ opacity: show }}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={ACCENT} strokeWidth={1.5} strokeDasharray="3 7" filter="url(#iGlow)" style={flow > 0 ? { animation: 'flowDashFast 1.3s linear infinite' } : undefined} />
    </g>
  )
}

function ConciergeHub({ show, pulse }: { show: number; pulse: number }) {
  return (
    <g style={{ opacity: show, transform: `translate(0, ${(1 - show) * 20}px)`, transformOrigin: '600px 360px' }}>
      <circle cx={600} cy={360} r={160} fill="url(#hub)" opacity={0.5} />
      <circle cx={600} cy={360} r={80} fill="oklch(18% 0.012 260)" stroke={ACCENT} strokeWidth={1.5} filter="url(#iStrong)" />
      <circle cx={600} cy={360} r={12} fill={ACCENT} filter="url(#iStrong)" style={pulse > 0 ? { animation: 'pulseGlow 1.8s ease-in-out infinite' } : undefined} />
      <text x={600} y={400} fontSize="13" letterSpacing="3" fill={ACCENT} textAnchor="middle" fontWeight={600}>
        CONCIERGE
      </text>
      <text x={600} y={416} fontSize="10" fill={SUBTLE} textAnchor="middle" letterSpacing="1.5">
        coordinator · ADK
      </text>
    </g>
  )
}

function SkillsLayer({ show, active }: { show: number; active: number }) {
  const skills = ['event-catalog', 'hospitality-tiers', 'travel-logistics', 'dietary-accessibility', 'human-in-the-loop']
  // 5 pills × 190 wide + 4 × 14 gap = 1006; centred in 1200 → start at 97.
  const W = 190
  const GAP = 14
  const totalW = skills.length * W + (skills.length - 1) * GAP
  const startX = (1200 - totalW) / 2
  const y = 180
  return (
    <g style={{ opacity: show }}>
      {skills.map((s, i) => {
        const x = startX + i * (W + GAP)
        return (
          <g key={s} style={{ opacity: clamp(show - i * 0.12, 0, 1) }}>
            <rect x={x} y={y} width={W} height={40} rx={20} fill="oklch(20% 0.012 260)" stroke={TRACE} strokeWidth={0.8} filter={active > 0 ? 'url(#iGlow)' : undefined} />
            <circle cx={x + 16} cy={y + 20} r={3} fill={TRACE} />
            <text x={x + W / 2 + 6} y={y + 25} fontSize="10.5" fill={TRACE} textAnchor="middle" fontFamily="Geist Mono, ui-monospace, monospace">
              {s}
            </text>
            {/* connector to hub */}
            <line x1={x + W / 2} y1={y + 40} x2={600} y2={280} stroke={TRACE} strokeWidth={0.6} strokeDasharray="2 4" strokeOpacity={0.6} style={active > 0 ? { animation: `flowDashFast ${2.1 + i * 0.15}s linear infinite` } : undefined} />
          </g>
        )
      })}
    </g>
  )
}

function MemoryLayer({ show, active }: { show: number; active: number }) {
  // Panel: x=890, y=380, width=260, height=200 → bottom 580, fits inside the stage.
  const px = 890
  const py = 380
  const pw = 260
  const ph = 200
  const facts = [
    { y: py + 74, text: 'vegan for guest 2', hit: true },
    { y: py + 104, text: 'business-class before midnight', hit: false },
    { y: py + 134, text: 'gluten-free for guest 5', hit: true },
    { y: py + 164, text: 'prefers 2 adjoining suites', hit: false },
  ]
  return (
    <g style={{ opacity: show }}>
      <rect x={px} y={py} width={pw} height={ph} rx={14} fill="oklch(16% 0.012 260)" stroke="oklch(32% 0.012 260)" strokeWidth={0.8} />
      <text x={px + 20} y={py + 28} fontSize="10" letterSpacing="2.4" fill={SUBTLE} fontWeight={500}>
        LONG-TERM MEMORY
      </text>
      <text x={px + 20} y={py + 48} fontSize="9" fill={SUBTLE} letterSpacing="1.2" fontFamily="Geist Mono, ui-monospace, monospace">
        gemini-embedding-2
      </text>
      <line x1={px + 20} y1={py + 60} x2={px + pw - 20} y2={py + 60} stroke="oklch(28% 0.01 260)" strokeWidth={0.5} />
      {facts.map((f, i) => (
        <g key={i} style={{ opacity: clamp(show - 0.1 * i, 0, 1) }}>
          <rect
            x={px + 14}
            y={f.y}
            width={pw - 28}
            height={24}
            rx={6}
            fill={f.hit ? `color-mix(in oklab, ${ACCENT} 20%, transparent)` : 'transparent'}
            stroke={f.hit ? ACCENT : 'oklch(28% 0.01 260)'}
            strokeWidth={f.hit ? 1 : 0.5}
            filter={f.hit && active > 0 ? 'url(#iGlow)' : undefined}
          />
          <text x={px + 26} y={f.y + 16} fontSize="10" fill={f.hit ? ACCENT : MUTED}>
            {f.text}
          </text>
        </g>
      ))}
      {/* recall arcs from hub → hits */}
      {facts.filter((f) => f.hit).map((f, i) => (
        <path
          key={`arc-${i}`}
          d={`M 680 340 C 780 340, 830 ${f.y + 12}, ${px + 4} ${f.y + 12}`}
          stroke={ACCENT}
          strokeWidth={1.1}
          strokeDasharray="2 5"
          fill="none"
          opacity={active}
          filter="url(#iGlow)"
          style={{ animation: `flowDashFast ${2 + i * 0.3}s linear infinite` }}
        />
      ))}
    </g>
  )
}

function SpecialistRing({ show, active, elapsed }: { show: number; active: number; elapsed: number }) {
  const specs = [
    { name: 'Researcher', angle: -150 },
    { name: 'Logistics', angle: -115 },
    { name: 'Experience', angle: -80 },
    { name: 'Budget', angle: -45 },
    { name: 'Personalizer', angle: -10 },
  ]
  const cx = 600
  const cy = 360
  const R = 290
  return (
    <g style={{ opacity: show }}>
      {specs.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180
        const x = cx + Math.cos(rad) * R
        const y = cy + Math.sin(rad) * R
        const appear = clamp(show - i * 0.08, 0, 1)
        return (
          <g key={s.name} style={{ opacity: appear }}>
            {/* arrow coordinator → specialist */}
            <path
              d={`M ${cx + Math.cos(rad) * 86} ${cy + Math.sin(rad) * 86} L ${x - Math.cos(rad) * 46} ${y - Math.sin(rad) * 46}`}
              stroke={ACCENT}
              strokeWidth={1.2}
              strokeDasharray="2 6"
              fill="none"
              opacity={active}
              filter="url(#iGlow)"
              style={{ animation: `flowDashFast ${1.6 + i * 0.2}s linear infinite` }}
            />
            {/* node */}
            <circle cx={x} cy={y} r={44} fill="oklch(18% 0.012 260)" stroke={TRACE} strokeWidth={1} filter="url(#iGlow)" />
            <circle cx={x} cy={y} r={5} fill={TRACE} style={{ animation: `pulseGlow ${2 + i * 0.2}s ease-in-out infinite` }} />
            <text x={x} y={y + 64} fontSize="11" fill={MUTED} textAnchor="middle" fontWeight={500}>
              {s.name}
            </text>
          </g>
        )
      })}
      {/* between 19 and 23, show tool labels on specialists */}
      {elapsed > 18.5 && elapsed < 23 ? (
        <>
          <ToolCallout x={cx + Math.cos((-115 * Math.PI) / 180) * R} y={cy + Math.sin((-115 * Math.PI) / 180) * R} text="hotels_near_event" />
          <ToolCallout x={cx + Math.cos((-80 * Math.PI) / 180) * R} y={cy + Math.sin((-80 * Math.PI) / 180) * R} text="tiers_for_event" />
          <ToolCallout x={cx + Math.cos((-150 * Math.PI) / 180) * R} y={cy + Math.sin((-150 * Math.PI) / 180) * R} text="search_events" />
        </>
      ) : null}
    </g>
  )
}

function ToolCallout({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect x={x - 70} y={y - 78} width={140} height={22} rx={11} fill={`color-mix(in oklab, ${ACCENT} 18%, transparent)`} stroke={ACCENT} strokeWidth={0.7} filter="url(#iGlow)" />
      <text x={x} y={y - 63} fontSize="9.5" fill={ACCENT} textAnchor="middle" fontFamily="Geist Mono, ui-monospace, monospace">
        {text}
      </text>
    </g>
  )
}

function ToolOrbit({ show, active: _active, elapsed }: { show: number; active: number; elapsed: number }) {
  // Orbit rings around the hub — tools listed as a decorative ring.
  const t = elapsed * 0.3
  const tools = ['search_events', 'hotels_near_event', 'find_flights', 'tiers_for_event', 'tier_detail', 'plan_arrangements']
  const cx = 600
  const cy = 360
  const R = 132
  return (
    <g style={{ opacity: show * 0.7 }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="oklch(32% 0.012 260)" strokeWidth={0.4} strokeDasharray="2 6" />
      {tools.map((name, i) => {
        const a = (i * (360 / tools.length) + t * 60) * (Math.PI / 180)
        const x = cx + Math.cos(a) * R
        const y = cy + Math.sin(a) * R
        return (
          <g key={name}>
            <circle cx={x} cy={y} r={3.5} fill={TRACE} opacity={0.8} />
            <text x={x + 8} y={y + 3} fontSize="8.5" fill={SUBTLE} fontFamily="Geist Mono, ui-monospace, monospace" opacity={0.75}>
              {name}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function ResearchLoop({ show, elapsed }: { show: number; elapsed: number }) {
  // Positioned in the clear band between the context-budget bar (≈y=286)
  // and the user prompt box (y=520). Keeps the centre of the stage free
  // for the coordinator and the specialist ring.
  const steps = ['plan', 'search', 'critique', 'refine']
  const panelX = 40
  const panelY = 320
  const panelW = 360
  const panelH = 170
  const stepY = panelY + 70
  const t = Math.max(0, elapsed - 22.5)
  const activeIdx = Math.min(steps.length - 1, Math.floor(t / 0.9))
  return (
    <g style={{ opacity: show }}>
      <rect x={panelX} y={panelY} width={panelW} height={panelH} rx={14} fill="oklch(17% 0.012 260)" stroke={TRACE} strokeWidth={0.8} filter="url(#iGlow)" />
      <text x={panelX + 20} y={panelY + 24} fontSize="10" letterSpacing="2.2" fill={SUBTLE}>
        DEEP RESEARCH · LoopAgent
      </text>
      <text x={panelX + 20} y={panelY + 42} fontSize="9" fill={SUBTLE} letterSpacing="1.2">
        agent workflow
      </text>
      {steps.map((s, i) => {
        const x = panelX + 26 + i * 82
        const on = i <= activeIdx
        return (
          <g key={s}>
            <rect x={x} y={stepY - 12} width={72} height={28} rx={14} fill={on ? `color-mix(in oklab, ${ACCENT} 20%, transparent)` : 'transparent'} stroke={on ? ACCENT : 'oklch(34% 0.01 260)'} strokeWidth={on ? 1 : 0.6} filter={on ? 'url(#iGlow)' : undefined} />
            <text x={x + 36} y={stepY + 5} fontSize="10" fill={on ? ACCENT : MUTED} textAnchor="middle" fontWeight={on ? 500 : 400}>
              {s}
            </text>
            {i < steps.length - 1 ? (
              <path d={`M ${x + 74} ${stepY + 2} L ${x + 82} ${stepY + 2}`} stroke={on ? ACCENT : 'oklch(34% 0.01 260)'} strokeWidth={1} markerEnd="url(#iAr)" />
            ) : null}
          </g>
        )
      })}
      <line x1={panelX + 20} y1={stepY + 36} x2={panelX + panelW - 20} y2={stepY + 36} stroke="oklch(28% 0.01 260)" strokeWidth={0.5} />
      <text x={panelX + 20} y={stepY + 58} fontSize="10" fill={SUBTLE} fontFamily="Geist Mono, ui-monospace, monospace">
        research_scratchpad · 4 sub-questions
      </text>
      <text x={panelX + 20} y={stepY + 74} fontSize="9" fill={SUBTLE} fontFamily="Geist Mono, ui-monospace, monospace" opacity={0.7}>
        findings · citations · coverage check
      </text>
    </g>
  )
}

function ArtifactStream({ show, elapsed }: { show: number; elapsed: number }) {
  const items = [
    { kind: 'itinerary', x: 940, y: 160 },
    { kind: 'option_card_grid', x: 940, y: 240 },
    { kind: 'option_card_grid', x: 940, y: 320 },
    { kind: 'pricing_breakdown', x: 940, y: 400 },
  ]
  return (
    <g style={{ opacity: show }}>
      {items.map((it, i) => {
        const t = clamp((elapsed - (26.5 + i * 0.4)) / 0.9, 0, 1)
        return (
          <g key={i} style={{ opacity: t }}>
            <rect x={it.x} y={it.y} width={200} height={64} rx={10} fill="oklch(20% 0.012 260)" stroke={ACCENT} strokeWidth={0.8} filter="url(#iGlow)" />
            <rect x={it.x + 14} y={it.y + 14} width={140} height={6} rx={2} fill={ACCENT} opacity={0.7} />
            <rect x={it.x + 14} y={it.y + 28} width={100} height={4} rx={2} fill={MUTED} opacity={0.4} />
            <rect x={it.x + 14} y={it.y + 38} width={120} height={4} rx={2} fill={MUTED} opacity={0.4} />
            <rect x={it.x + 14} y={it.y + 48} width={80} height={4} rx={2} fill={MUTED} opacity={0.4} />
            <text x={it.x + 190} y={it.y + 58} fontSize="7.5" fill={SUBTLE} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
              {it.kind}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function HitlGate({ show, elapsed }: { show: number; elapsed: number }) {
  const approved = elapsed > 33.5
  return (
    <g style={{ opacity: show }}>
      <rect x={440} y={540} width={320} height={120} rx={14} fill="oklch(18% 0.012 260)" stroke={ACCENT} strokeWidth={1.3} filter="url(#iStrong)" />
      <rect x={440} y={540} width={320} height={2} fill={ACCENT} opacity={0.8} filter="url(#iGlow)" />
      <text x={460} y={564} fontSize="9" fill={SUBTLE} letterSpacing="2">
        A2UI · approval_request
      </text>
      <text x={460} y={586} fontSize="13" fill={WHITE} fontWeight={600}>
        Confirm arrangement
      </text>
      <text x={460} y={604} fontSize="10" fill={MUTED}>
        Wimbledon 2026 · family of six · ₹58L total
      </text>
      <rect x={460} y={618} width={100} height={26} rx={6} fill="oklch(22% 0.012 260)" stroke="oklch(34% 0.01 260)" />
      <text x={510} y={636} fontSize="10" fill={MUTED} textAnchor="middle">
        Not yet
      </text>
      <rect x={570} y={618} width={170} height={26} rx={6} fill={approved ? 'oklch(72% 0.11 160)' : ACCENT} filter="url(#iGlow)" />
      <text x={655} y={636} fontSize="10.5" fill="oklch(12% 0 0)" textAnchor="middle" fontWeight={600}>
        {approved ? 'Approved' : 'Approve and proceed'}
      </text>
      {elapsed > 32.5 && elapsed < 34 ? (
        <circle cx={655} cy={631} r={18} fill="none" stroke={ACCENT} strokeWidth={1.2} opacity={0.5}>
          <animate attributeName="r" from="10" to="32" dur="0.8s" fill="freeze" />
          <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" fill="freeze" />
        </circle>
      ) : null}
    </g>
  )
}

function ContextCompact({ show, elapsed }: { show: number; elapsed: number }) {
  const t = clamp((elapsed - 34.5) / 2, 0, 1)
  return (
    <g style={{ opacity: show }}>
      <text x={60} y={260} fontSize="10" letterSpacing="2" fill={SUBTLE}>
        CONTEXT BUDGET
      </text>
      <rect x={60} y={272} width={360} height={14} rx={3} fill="oklch(20% 0.012 260)" stroke="oklch(30% 0.01 260)" />
      {/* 11 small bars collapsing into 1 summary */}
      {Array.from({ length: 11 }).map((_, i) => {
        const bw = 20
        const gap = 1
        const fromX = 62 + i * (bw + gap)
        const toX = 62
        const x = fromX + (toX - fromX) * t
        const w = bw + (44 - bw) * (i === 0 ? t : 0) // bar 0 becomes summary
        const opacity = i === 0 ? 1 : 1 - t
        return (
          <rect
            key={i}
            x={x}
            y={273}
            width={Math.max(2, w)}
            height={12}
            rx={1}
            fill={i === 0 ? ACCENT : MUTED}
            opacity={opacity * 0.9}
            filter={i === 0 ? 'url(#iGlow)' : undefined}
          />
        )
      })}
      <text x={440} y={284} fontSize="10" fill={TRACE} fontFamily="Geist Mono, ui-monospace, monospace" style={{ opacity: t }}>
        context · compact (−120k tokens)
      </text>
    </g>
  )
}

function Dossier({ show, elapsed }: { show: number; elapsed: number }) {
  const t = clamp((elapsed - 37.5) / 1.5, 0, 1)
  return (
    <g style={{ opacity: show * t }}>
      <rect x={440} y={300} width={320} height={160} rx={14} fill="oklch(20% 0.012 260)" stroke={ACCENT} strokeWidth={1.4} filter="url(#iStrong)" />
      <rect x={440} y={300} width={320} height={2} fill={ACCENT} filter="url(#iGlow)" />
      <text x={460} y={324} fontSize="9" fill={SUBTLE} letterSpacing="2.2">
        DOSSIER · DELIVERED
      </text>
      <text x={460} y={350} fontSize="18" fill={WHITE} fontWeight={600} className="display">
        Wimbledon · July 2026
      </text>
      <text x={460} y={372} fontSize="11" fill={MUTED}>
        The Connaught · No.1 Court & Centre Court
      </text>
      <rect x={460} y={390} width={280} height={1} fill="oklch(30% 0.01 260)" />
      <text x={460} y={410} fontSize="10" fill={SUBTLE}>
        GUESTS
      </text>
      <text x={740} y={410} fontSize="11" fill={MUTED} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
        6
      </text>
      <text x={460} y={428} fontSize="10" fill={SUBTLE}>
        NIGHTS
      </text>
      <text x={740} y={428} fontSize="11" fill={MUTED} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
        5
      </text>
      <text x={460} y={446} fontSize="10" fill={SUBTLE}>
        TOTAL
      </text>
      <text x={740} y={446} fontSize="14" fill={ACCENT} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace" fontWeight={600}>
        ₹58.42 L
      </text>
    </g>
  )
}

function Credits({ show }: { show: number }) {
  const creds = ['ADK', 'A2A', 'A2UI', 'gemini-3-flash', 'gemini-embedding-2', 'LoopAgent', 'HitlBus']
  return (
    <g style={{ opacity: show * 0.9 }}>
      {creds.map((c, i) => (
        <text key={c} x={600 + (i - (creds.length - 1) / 2) * 110} y={690} fontSize="10.5" fill={SUBTLE} textAnchor="middle" letterSpacing="1.5" fontFamily="Geist Mono, ui-monospace, monospace">
          {c}
        </text>
      ))}
    </g>
  )
}

// -----------------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n
}
