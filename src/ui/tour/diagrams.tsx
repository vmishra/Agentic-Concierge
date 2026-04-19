/**
 * Animated SVG diagrams for the Architecture Tour.
 *
 * Each diagram is a self-contained, on-mount-animated illustration of one
 * concept. The aesthetic is restrained (monochrome with two accents) but the
 * motion is deliberately cinematic: glow filters, flowing dashed arrows,
 * pulsing nodes, staged reveals. The flow of information is the star.
 */

import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

const ACCENT = 'oklch(78% 0.12 85)'
const TRACE = 'oklch(68% 0.075 200)'
const SOFT = 'oklch(22% 0.014 260)'
const SOFT2 = 'oklch(26% 0.014 260)'
const BORDER = 'oklch(34% 0.014 260)'
const MUTED = 'oklch(72% 0.010 260)'
const SUBTLE = 'oklch(54% 0.010 260)'

// Shared <defs> — a glow filter + flowing-dash arrow marker.
function Defs() {
  return (
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glowStrong" x="-75%" y="-75%" width="250%" height="250%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <marker
        id="arAccent"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
      </marker>
      <marker
        id="arTrace"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M0,0 L10,5 L0,10 z" fill={TRACE} />
      </marker>
      {/* Inline keyframes so each diagram is self-sufficient. */}
      <style>{`
        @keyframes flowDash { to { stroke-dashoffset: -40 } }
        @keyframes pulseRing {
          0%   { r: 44; opacity: 0.55 }
          70%  { r: 88; opacity: 0 }
          100% { r: 88; opacity: 0 }
        }
        @keyframes pulseNode {
          0%,100% { r: 4.5; opacity: 1 }
          50%     { r: 6.5; opacity: 0.7 }
        }
        @keyframes pulseNodeSmall {
          0%,100% { r: 3.5; opacity: 0.9 }
          50%     { r: 5; opacity: 0.6 }
        }
        @keyframes shimmer {
          0%   { opacity: 0.35 }
          50%  { opacity: 1 }
          100% { opacity: 0.35 }
        }
      `}</style>
    </defs>
  )
}

// Deliberately slower entrance animations — the tour doubles as a slide
// deck, and the audience should have time to read each label as it lands.
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 1.6, ease: 'easeOut' } },
}

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 22 } },
}

// ---------------------------------------------------------------------------
// 01 — Overture: the end-to-end data flow of a single turn
// ---------------------------------------------------------------------------

export function OvertureDiagram() {
  const specialists = [
    { name: 'Researcher', sub: 'deep research · loop', y: 120 },
    { name: 'Logistics', sub: 'hotels · flights', y: 180 },
    { name: 'Experience', sub: 'hospitality tiers', y: 240 },
    { name: 'Budget', sub: 'pricing breakdown', y: 300 },
    { name: 'Personalizer', sub: 'memory · narrative', y: 360 },
  ]

  const userX = 20
  const coordX = 180
  const coordY = 240
  const specX = 360
  const artX = 540

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      {/* Column headers */}
      <motion.g variants={fadeUp}>
        <text x={userX + 10} y={38} fontSize="9.5" letterSpacing="2.5" fill={SUBTLE}>
          INPUT
        </text>
        <text x={coordX + 2} y={38} fontSize="9.5" letterSpacing="2.5" fill={SUBTLE}>
          COORDINATOR
        </text>
        <text x={specX + 2} y={38} fontSize="9.5" letterSpacing="2.5" fill={SUBTLE}>
          SPECIALISTS · A2A
        </text>
        <text x={artX + 2} y={38} fontSize="9.5" letterSpacing="2.5" fill={SUBTLE}>
          A2UI
        </text>
      </motion.g>

      {/* User block */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.05s' }}>
        <rect x={userX} y={216} width={122} height={58} rx={12} fill={SOFT2} stroke={ACCENT} strokeWidth={1} filter="url(#glow)" />
        <text x={userX + 10} y={238} fontSize="9" letterSpacing="2" fill={SUBTLE}>
          USER
        </text>
        <text x={userX + 10} y={256} fontSize="10.5" fill={MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
          "F1 Abu Dhabi"
        </text>
        <text x={userX + 10} y={268} fontSize="9" fill={SUBTLE}>
          4 guests · ₹50L
        </text>
      </motion.g>

      {/* User → Coordinator arrow */}
      <g>
        <motion.path
          d={`M ${userX + 122} ${coordY} L ${coordX - 10} ${coordY}`}
          stroke={ACCENT}
          strokeWidth={1.3}
          fill="none"
          markerEnd="url(#arAccent)"
          filter="url(#glow)"
          variants={drawLine}
          style={{ transitionDelay: '0.2s' }}
        />
        <path
          d={`M ${userX + 122} ${coordY} L ${coordX - 10} ${coordY}`}
          stroke={ACCENT}
          strokeWidth={1.4}
          strokeDasharray="2 5"
          fill="none"
          style={{ animation: 'flowDash 2.80s linear infinite' }}
        />
      </g>

      {/* Coordinator — Concierge box with skills/memory layers */}
      <motion.g variants={popIn} style={{ transitionDelay: '0.3s' }}>
        <rect x={coordX} y={180} width={140} height={120} rx={14} fill={SOFT2} stroke={ACCENT} strokeWidth={1.4} filter="url(#glow)" />
        <text x={coordX + 70} y={206} fontSize="11" letterSpacing="2.2" fill={ACCENT} textAnchor="middle" fontWeight={600}>
          CONCIERGE
        </text>
        <line x1={coordX + 16} y1={218} x2={coordX + 124} y2={218} stroke={BORDER} strokeWidth={0.5} />
        {/* internal layers */}
        <text x={coordX + 16} y={234} fontSize="9.5" fill={TRACE}>
          · skills.load()
        </text>
        <text x={coordX + 16} y={250} fontSize="9.5" fill={TRACE}>
          · memory.search()
        </text>
        <text x={coordX + 16} y={266} fontSize="9.5" fill={TRACE}>
          · context.budget
        </text>
        <text x={coordX + 16} y={282} fontSize="9.5" fill={ACCENT}>
          · dispatch ⇉
        </text>
        <circle
          cx={coordX + 70}
          cy={coordY}
          r={3}
          fill={ACCENT}
          opacity={0.6}
          style={{ animation: 'pulseNodeSmall 2.24s ease-in-out infinite' }}
        />
      </motion.g>

      {/* Parallel fan-out arrows — drawn after all 5 specialists have settled. */}
      {specialists.map((s, i) => (
        <g key={`arrow-${i}`}>
          <motion.path
            d={`M ${coordX + 140} ${coordY} C ${coordX + 200} ${coordY} ${specX - 60} ${s.y + 20} ${specX - 8} ${s.y + 20}`}
            stroke={BORDER}
            strokeWidth={0.8}
            fill="none"
            variants={drawLine}
            style={{ transitionDelay: `${1.65 + i * 0.08}s` }}
          />
          <path
            d={`M ${coordX + 140} ${coordY} C ${coordX + 200} ${coordY} ${specX - 60} ${s.y + 20} ${specX - 8} ${s.y + 20}`}
            stroke={ACCENT}
            strokeWidth={1.2}
            strokeDasharray="2 6"
            fill="none"
            strokeOpacity={0.75}
            filter="url(#glow)"
            style={{ animation: `flowDash ${1.8 + i * 0.2}s linear infinite` }}
          />
        </g>
      ))}

      {/* Specialist nodes */}
      {specialists.map((s, i) => (
        <motion.g key={s.name} variants={popIn} style={{ transitionDelay: `${0.95 + i * 0.1}s` }}>
          <rect x={specX} y={s.y} width={140} height={40} rx={10} fill={SOFT} stroke={BORDER} strokeWidth={0.8} />
          <circle
            cx={specX + 14}
            cy={s.y + 20}
            r={3.5}
            fill={TRACE}
            filter="url(#glow)"
            style={{ animation: `pulseNodeSmall ${1.4 + i * 0.1}s ease-in-out infinite` }}
          />
          <text x={specX + 26} y={s.y + 18} fontSize="11.5" fill={MUTED} fontWeight={500}>
            {s.name}
          </text>
          <text x={specX + 26} y={s.y + 32} fontSize="9.5" fill={SUBTLE}>
            {s.sub}
          </text>
        </motion.g>
      ))}

      {/* Artifact column — 5 small cards appear first, then the return arrows. */}
      {specialists.map((s, i) => {
        const kinds = ['research_scratchpad', 'option_card_grid', 'option_card_grid', 'pricing_breakdown', 'note']
        return (
          <motion.g key={`art-${i}`} variants={popIn} style={{ transitionDelay: `${2.7 + i * 0.1}s` }}>
            <rect x={artX} y={s.y} width={56} height={40} rx={6} fill={SOFT2} stroke={TRACE} strokeWidth={0.8} filter="url(#glow)" />
            <rect x={artX + 6} y={s.y + 8} width={44} height={5} rx={1} fill={TRACE} opacity={0.6} />
            <rect x={artX + 6} y={s.y + 17} width={34} height={3} rx={1} fill={MUTED} opacity={0.5} />
            <rect x={artX + 6} y={s.y + 24} width={40} height={3} rx={1} fill={MUTED} opacity={0.5} />
            <rect x={artX + 6} y={s.y + 31} width={26} height={3} rx={1} fill={MUTED} opacity={0.5} />
            <text x={artX + 28} y={s.y + 52} fontSize="7.5" fill={SUBTLE} textAnchor="middle" letterSpacing="0.5">
              {kinds[i]}
            </text>
          </motion.g>
        )
      })}

      {/* Specialists → artifacts — return flow, drawn after artifact cards appear. */}
      {specialists.map((s, i) => (
        <g key={`return-${i}`}>
          <motion.path
            d={`M ${specX + 140} ${s.y + 20} L ${artX - 8} ${s.y + 20}`}
            stroke={TRACE}
            strokeWidth={1.1}
            strokeDasharray="2 5"
            fill="none"
            filter="url(#glow)"
            variants={drawLine}
            style={{ transitionDelay: `${3.3 + i * 0.08}s`, animation: `flowDash ${2.8 + i * 0.35}s linear infinite` }}
          />
        </g>
      ))}

      {/* Bottom annotation band — the named technologies */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.5s' }}>
        <line x1={40} y1={420} x2={560} y2={420} stroke={BORDER} strokeWidth={0.5} strokeDasharray="2 4" />
        <text x={40} y={444} fontSize="9" fill={SUBTLE} letterSpacing="1.5">
          ADK
        </text>
        <text x={40} y={458} fontSize="8.5" fill={SUBTLE}>
          agent · skill · tool
        </text>

        <text x={170} y={444} fontSize="9" fill={SUBTLE} letterSpacing="1.5">
          A2A
        </text>
        <text x={170} y={458} fontSize="8.5" fill={SUBTLE}>
          agent-to-agent dispatch
        </text>

        <text x={320} y={444} fontSize="9" fill={SUBTLE} letterSpacing="1.5">
          gemini-embedding-2
        </text>
        <text x={320} y={458} fontSize="8.5" fill={SUBTLE}>
          memory recall
        </text>

        <text x={482} y={444} fontSize="9" fill={SUBTLE} letterSpacing="1.5">
          A2UI
        </text>
        <text x={482} y={458} fontSize="8.5" fill={SUBTLE}>
          typed components
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 02 — Skills: attach animation with glowing dashed connector
// ---------------------------------------------------------------------------

export function SkillsDiagram() {
  const skills = ['event-catalog', 'hospitality-tiers', 'travel-logistics', 'dietary-accessibility', 'gifting-narrative']
  const activeIdx = 1

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      {/* Agent */}
      <motion.g variants={fadeUp}>
        <rect x={220} y={60} width={160} height={82} rx={12} fill={SOFT2} stroke={ACCENT} strokeWidth={1.2} filter="url(#glow)" />
        <text x={300} y={90} fontSize="11" letterSpacing="2.5" fill={ACCENT} textAnchor="middle" fontWeight={600}>
          AGENT · CONCIERGE
        </text>
        <text x={300} y={112} fontSize="11" fill={SUBTLE} textAnchor="middle">
          slim system prompt
        </text>
        <text x={300} y={128} fontSize="11" fill={SUBTLE} textAnchor="middle">
          pulls context on demand
        </text>
      </motion.g>

      {/* Active toolbelt chip row */}
      <motion.text
        x={300}
        y={178}
        fontSize="10"
        letterSpacing="2.5"
        fill={SUBTLE}
        textAnchor="middle"
        variants={fadeUp}
        style={{ transitionDelay: '0.3s' }}
      >
        ACTIVE TOOLBELT
      </motion.text>

      {['tiers_for_event', 'tier_detail'].map((t, i) => (
        <motion.g key={t} variants={popIn} style={{ transitionDelay: `${1.0 + i * 0.15}s` }}>
          <rect
            x={200 + i * 110}
            y={192}
            width={100}
            height={34}
            rx={17}
            fill={`color-mix(in oklab, ${TRACE} 16%, transparent)`}
            stroke={TRACE}
            strokeWidth={1}
            filter="url(#glow)"
          />
          <text x={250 + i * 110} y={213} fontSize="11" fill={TRACE} textAnchor="middle" fontWeight={500} fontFamily="Geist Mono, ui-monospace, monospace">
            {t}
          </text>
        </motion.g>
      ))}

      {/* Skills row */}
      {skills.map((s, i) => {
        const x = 30 + i * 112
        const isActive = i === activeIdx
        return (
          <motion.g key={s} variants={fadeUp} style={{ transitionDelay: `${0.4 + i * 0.08}s` }}>
            <rect
              x={x}
              y={340}
              width={104}
              height={74}
              rx={12}
              fill={isActive ? SOFT2 : SOFT}
              stroke={isActive ? ACCENT : BORDER}
              strokeWidth={isActive ? 1.4 : 0.7}
              strokeDasharray={isActive ? '0' : '3 3'}
              filter={isActive ? 'url(#glow)' : undefined}
            />
            <text x={x + 52} y={362} fontSize="9" fill={isActive ? ACCENT : SUBTLE} textAnchor="middle" letterSpacing="1.8">
              SKILL
            </text>
            <text x={x + 52} y={384} fontSize="10.5" fill={isActive ? ACCENT : MUTED} textAnchor="middle" fontWeight={500}>
              {s.split('-')[0]}
            </text>
            <text x={x + 52} y={400} fontSize="9.5" fill={SUBTLE} textAnchor="middle">
              {s.split('-').slice(1).join(' ') || '·'}
            </text>
          </motion.g>
        )
      })}

      {/* Activation connector from active skill → agent */}
      <motion.path
        d={`M ${30 + activeIdx * 112 + 52} 340 Q 300 290 300 230`}
        stroke={BORDER}
        strokeWidth={1}
        fill="none"
        variants={drawLine}
        style={{ transitionDelay: '0.85s' }}
      />
      <path
        d={`M ${30 + activeIdx * 112 + 52} 340 Q 300 290 300 230`}
        stroke={ACCENT}
        strokeWidth={1.4}
        strokeDasharray="3 6"
        fill="none"
        filter="url(#glow)"
        style={{ animation: 'flowDash 3.15s linear infinite' }}
      />
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.05s' }}>
        <rect
          x={330}
          y={268}
          width={118}
          height={26}
          rx={13}
          fill={`color-mix(in oklab, ${ACCENT} 18%, transparent)`}
          stroke={ACCENT}
          strokeWidth={0.9}
          filter="url(#glow)"
        />
        <text x={389} y={285} fontSize="10.5" fill={ACCENT} textAnchor="middle" fontWeight={500} fontFamily="Geist Mono, ui-monospace, monospace">
          skill · load
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 03 — Tools: manifest catalog with live "loaded" glow + parallel fan-out
// ---------------------------------------------------------------------------

export function ToolsDiagram() {
  const manifests = [
    { name: 'search_events', loaded: true },
    { name: 'get_event', loaded: false },
    { name: 'hotels_near_event', loaded: true },
    { name: 'find_flights', loaded: false },
    { name: 'tiers_for_event', loaded: true },
    { name: 'tier_detail', loaded: false },
    { name: 'plan_arrangements', loaded: false },
    { name: 'narrative_for', loaded: false },
  ]

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      <motion.text x={40} y={38} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE} variants={fadeUp}>
        TOOL CATALOG · LAZY
      </motion.text>

      {manifests.map((m, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const x = 40 + col * 260
        const y = 56 + row * 56
        return (
          <motion.g key={m.name} variants={fadeUp} style={{ transitionDelay: `${0.1 + i * 0.07}s` }}>
            <rect
              x={x}
              y={y}
              width={240}
              height={44}
              rx={10}
              fill={m.loaded ? `color-mix(in oklab, ${TRACE} 14%, transparent)` : SOFT}
              stroke={m.loaded ? TRACE : BORDER}
              strokeWidth={m.loaded ? 1 : 0.6}
              strokeDasharray={m.loaded ? '0' : '3 3'}
              filter={m.loaded ? 'url(#glow)' : undefined}
            />
            <circle
              cx={x + 18}
              cy={y + 22}
              r={m.loaded ? 4 : 3}
              fill={m.loaded ? TRACE : BORDER}
              style={m.loaded ? { animation: `pulseNodeSmall ${1.8 + i * 0.2}s ease-in-out infinite` } : undefined}
            />
            <text x={x + 34} y={y + 27} fontSize="11.5" fill={m.loaded ? TRACE : MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
              {m.name}
            </text>
            <text x={x + 224} y={y + 27} fontSize="9.5" fill={SUBTLE} textAnchor="end" letterSpacing="1.2">
              {m.loaded ? 'LOADED' : 'manifest'}
            </text>
          </motion.g>
        )
      })}

      {/* Parallel fan-out indicator */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.9s' }}>
        <text x={40} y={386} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE}>
          PARALLEL FAN-OUT · Promise.all
        </text>
        <rect x={40} y={398} width={520} height={52} rx={12} fill={SOFT} stroke={BORDER} />
        {/* three flowing mini-lines representing concurrent calls */}
        {[0, 1, 2].map((k) => (
          <line
            key={k}
            x1={64}
            y1={414 + k * 10}
            x2={536}
            y2={414 + k * 10}
            stroke={ACCENT}
            strokeWidth={1}
            strokeDasharray="4 10"
            strokeOpacity={0.7}
            filter="url(#glow)"
            style={{ animation: `flowDash ${1.6 + k * 0.3}s linear infinite` }}
          />
        ))}
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 04 — Memory: write/recall with glowing arcs
// ---------------------------------------------------------------------------

export function MemoryDiagram() {
  const facts = [
    { text: 'business-class flights', y: 136, match: 0.22 },
    { text: 'group of four', y: 180, match: 0.18 },
    { text: 'partner is vegan', y: 224, match: 0.71 },
    { text: 'gluten-free for guest 3', y: 268, match: 0.64 },
  ]

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      {/* Query */}
      <motion.g variants={fadeUp}>
        <rect x={40} y={48} width={224} height={56} rx={12} fill={SOFT2} stroke={ACCENT} strokeWidth={1.2} filter="url(#glow)" />
        <text x={58} y={72} fontSize="9.5" letterSpacing="2.2" fill={SUBTLE}>
          NEW USER MESSAGE
        </text>
        <text x={58} y={92} fontSize="12" fill={ACCENT} fontFamily="Geist Mono, ui-monospace, monospace">
          "dietary preferences"
        </text>
      </motion.g>

      {/* Store */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.2s' }}>
        <rect x={320} y={100} width={240} height={216} rx={14} fill={SOFT} stroke={BORDER} strokeWidth={0.8} />
        <text x={336} y={124} fontSize="9.5" letterSpacing="2.2" fill={SUBTLE}>
          LONG-TERM MEMORY · gemini-embedding-2
        </text>
      </motion.g>

      {facts.map((f, i) => {
        const isHit = f.match > 0.5
        return (
          <motion.g key={i} variants={fadeUp} style={{ transitionDelay: `${0.4 + i * 0.1}s` }}>
            <rect
              x={332}
              y={f.y}
              width={216}
              height={32}
              rx={8}
              fill={isHit ? `color-mix(in oklab, ${ACCENT} 18%, transparent)` : 'transparent'}
              stroke={isHit ? ACCENT : BORDER}
              strokeWidth={isHit ? 1 : 0.5}
              filter={isHit ? 'url(#glow)' : undefined}
            />
            <text x={344} y={f.y + 20} fontSize="11" fill={isHit ? ACCENT : MUTED}>
              {f.text}
            </text>
            <text x={540} y={f.y + 20} fontSize="10" fill={isHit ? ACCENT : SUBTLE} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
              {f.match.toFixed(2)}
            </text>
          </motion.g>
        )
      })}

      {/* Similarity arcs — glowing, flowing */}
      {facts
        .filter((f) => f.match > 0.5)
        .map((f, i) => (
          <g key={`arc-${i}`}>
            <motion.path
              d={`M 264 76 C 296 76, 296 ${f.y + 16}, 328 ${f.y + 16}`}
              stroke={BORDER}
              strokeWidth={0.8}
              fill="none"
              variants={drawLine}
              style={{ transitionDelay: `${0.85 + i * 0.15}s` }}
            />
            <path
              d={`M 264 76 C 296 76, 296 ${f.y + 16}, 328 ${f.y + 16}`}
              stroke={ACCENT}
              strokeWidth={1.2}
              strokeDasharray="2 5"
              fill="none"
              filter="url(#glow)"
              style={{ animation: `flowDash ${1.6 + i * 0.3}s linear infinite` }}
            />
          </g>
        ))}

      {/* Injection target — system prompt */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.35s' }}>
        <text x={40} y={362} fontSize="10.5" letterSpacing="2.2" fill={SUBTLE}>
          INJECTED INTO COORDINATOR PROMPT
        </text>
        <rect x={40} y={374} width={520} height={64} rx={10} fill={SOFT2} stroke={ACCENT} strokeWidth={0.9} strokeDasharray="3 3" filter="url(#glow)" />
        <text x={58} y={400} fontSize="11" fill={MUTED}>
          Known preferences: partner is vegan ·
        </text>
        <text x={58} y={418} fontSize="11" fill={MUTED}>
          gluten-free for guest 3
        </text>
      </motion.g>

      {/* Connecting line from store → injection */}
      <path
        d="M 440 316 L 440 374"
        stroke={TRACE}
        strokeWidth={1}
        strokeDasharray="2 5"
        fill="none"
        filter="url(#glow)"
        markerEnd="url(#arTrace)"
        style={{ animation: 'flowDash 3.15s linear infinite' }}
      />
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 05 — A2UI: JSON → rendered card (glowing arrow)
// ---------------------------------------------------------------------------

export function A2UIDiagram() {
  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      {/* Left: JSON */}
      <motion.g variants={fadeUp}>
        <text x={30} y={34} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE}>
          AGENT EMITS · A2UI
        </text>
        <rect x={30} y={44} width={256} height={384} rx={12} fill={SOFT} stroke={BORDER} strokeWidth={0.8} />
      </motion.g>

      {[
        { t: '{', x: 46, y: 70, c: MUTED },
        { t: '"kind": "option_card_grid",', x: 54, y: 92, c: ACCENT },
        { t: '"title": "Three hotels,"', x: 54, y: 112, c: MUTED },
        { t: '"columns": 3,', x: 54, y: 132, c: MUTED },
        { t: '"options": [', x: 54, y: 152, c: MUTED },
        { t: '{ "title": "Waldorf Astoria",', x: 70, y: 172, c: MUTED },
        { t: '  "price": 95000,', x: 70, y: 190, c: MUTED },
        { t: '  "badges": ["step-free"] },', x: 70, y: 208, c: MUTED },
        { t: '{ "title": "Ritz-Carlton" },', x: 70, y: 228, c: MUTED },
        { t: '{ "title": "Emirates Palace" }', x: 70, y: 246, c: MUTED },
        { t: '],', x: 54, y: 266, c: MUTED },
        { t: '"refinements": [', x: 54, y: 286, c: MUTED },
        { t: '{ "label": "Compare" },', x: 70, y: 306, c: TRACE },
        { t: '{ "label": "Quieter" }', x: 70, y: 326, c: TRACE },
        { t: ']', x: 54, y: 346, c: MUTED },
        { t: '}', x: 46, y: 366, c: MUTED },
      ].map((l, i) => (
        <motion.text
          key={i}
          x={l.x}
          y={l.y}
          fontSize="11"
          fill={l.c}
          fontFamily="Geist Mono, ui-monospace, monospace"
          variants={fadeUp}
          style={{ transitionDelay: `${0.1 + i * 0.04}s` }}
        >
          {l.t}
        </motion.text>
      ))}

      {/* Arrow — glowing, flowing */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.8s' }}>
        <path
          d="M 294 236 L 322 236"
          stroke={ACCENT}
          strokeWidth={1.4}
          markerEnd="url(#arAccent)"
          filter="url(#glow)"
        />
        <path
          d="M 294 236 L 322 236"
          stroke={ACCENT}
          strokeWidth={1.4}
          strokeDasharray="2 5"
          style={{ animation: 'flowDash 2.45s linear infinite' }}
        />
        <text x={308} y={226} fontSize="9.5" fill={ACCENT} textAnchor="middle" letterSpacing="1.8">
          render
        </text>
      </motion.g>

      {/* Right: rendered card mock */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.0s' }}>
        <rect x={330} y={44} width={240} height={384} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={1.1} filter="url(#glow)" />
        <text x={346} y={70} fontSize="9.5" letterSpacing="2.2" fill={SUBTLE}>
          RENDERED A2UI
        </text>
        <text x={346} y={96} fontSize="13" fill="white" fontWeight={600} className="display">
          Three hotels
        </text>
      </motion.g>

      {/* Three hotel mini-cards — positioned absolutely (no inner transform
          group, which was clashing with motion's scale animation and
          pushing cards off their coordinates). */}
      {[0, 1, 2].map((i) => {
        const cx = 346
        const cy = 118 + i * 92
        return (
          <motion.g
            key={i}
            variants={fadeUp}
            style={{ transitionDelay: `${1.2 + i * 0.12}s` }}
          >
            <rect x={cx} y={cy} width={208} height={80} rx={8} fill={SOFT2} stroke={BORDER} />
            <text x={cx + 12} y={cy + 20} fontSize="7.5" fill={SUBTLE} letterSpacing="1.3">
              {['FIVE-STAR', 'FIVE-STAR', 'PALACE'][i]}
            </text>
            <text x={cx + 12} y={cy + 38} fontSize="11" fill={MUTED} fontWeight={500}>
              {['Waldorf Astoria', 'Ritz-Carlton', 'Emirates Palace'][i]}
            </text>
            <rect
              x={cx + 12}
              y={cy + 48}
              width={54}
              height={16}
              rx={8}
              fill={`color-mix(in oklab, ${TRACE} 16%, transparent)`}
            />
            <text x={cx + 16} y={cy + 60} fontSize="9" fill={TRACE}>
              step-free
            </text>
            <text
              x={cx + 198}
              y={cy + 64}
              fontSize="11"
              fill={ACCENT}
              textAnchor="end"
              fontWeight={500}
              fontFamily="Geist Mono, ui-monospace, monospace"
            >
              {['₹0.95L', '₹0.78L', '₹1.68L'][i]}
            </text>
          </motion.g>
        )
      })}
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 06 — Runner: a flowing dot that visits each step
// ---------------------------------------------------------------------------

export function RunnerDiagram() {
  const steps = [
    { label: 'assemble prompt', sub: 'system + skills + memory' },
    { label: 'compact if > 30%', sub: 'roll old turns into summary' },
    { label: 'provider.generate', sub: 'stream tokens from Gemini' },
    { label: 'tool calls?', sub: 'Promise.all fan-out', decision: true },
    { label: 'sub-agent?', sub: 'agent-as-tool / A2A dispatch', decision: true },
    { label: 'loop until done', sub: 'provider says stop' },
    { label: 'afterModel callback', sub: 'trace · artifact · return' },
  ]

  return (
    <motion.svg viewBox="0 0 600 540" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      <motion.text x={40} y={30} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE} variants={fadeUp}>
        run() · ONE TURN
      </motion.text>

      {steps.map((s, i) => {
        const y = 50 + i * 62
        return (
          <motion.g key={i} variants={fadeUp} style={{ transitionDelay: `${0.1 + i * 0.1}s` }}>
            <rect
              x={40}
              y={y}
              width={520}
              height={48}
              rx={s.decision ? 24 : 10}
              fill={SOFT}
              stroke={s.decision ? ACCENT : BORDER}
              strokeWidth={s.decision ? 1.2 : 0.7}
              filter={s.decision ? 'url(#glow)' : undefined}
            />
            <text x={62} y={y + 22} fontSize="9" fill={SUBTLE} letterSpacing="2">
              {String(i + 1).padStart(2, '0')}
            </text>
            <text x={92} y={y + 22} fontSize="13" fill={s.decision ? ACCENT : MUTED} fontWeight={500}>
              {s.label}
            </text>
            <text x={92} y={y + 38} fontSize="10.5" fill={SUBTLE}>
              {s.sub}
            </text>

            {i < steps.length - 1 ? (
              <line
                x1={300}
                y1={y + 50}
                x2={300}
                y2={y + 60}
                stroke={ACCENT}
                strokeWidth={1.3}
                strokeDasharray="2 4"
                filter="url(#glow)"
                style={{ animation: 'flowDash 2.10s linear infinite' }}
              />
            ) : null}
          </motion.g>
        )
      })}

      {/* Loop-back arc on the right */}
      <motion.path
        d="M 560 322 Q 588 322, 588 248 Q 588 174, 560 174"
        stroke={TRACE}
        strokeWidth={1.2}
        strokeDasharray="3 5"
        fill="none"
        filter="url(#glow)"
        variants={drawLine}
        style={{ transitionDelay: '0.9s' }}
      />
      <path
        d="M 560 322 Q 588 322, 588 248 Q 588 174, 560 174"
        stroke={TRACE}
        strokeWidth={1.2}
        strokeDasharray="2 5"
        fill="none"
        filter="url(#glow)"
        style={{ animation: 'flowDash 2.80s linear infinite' }}
      />
      <text
        x={588}
        y={250}
        fontSize="10"
        fill={TRACE}
        textAnchor="middle"
        style={{ animation: 'shimmer 2s ease-in-out infinite' }}
      >
        loop
      </text>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// Agent Hierarchy — coordinator delegates; specialists can delegate further
// ---------------------------------------------------------------------------

export function HierarchyDiagram() {
  // L2: 5 nodes, each 100 wide, 10px gap. Start at x=30 → ends at x=570 (≤600).
  const L2_W = 100
  const L2_Y = 200
  const L2 = [
    { name: 'Researcher', x: 30 },
    { name: 'Logistics', x: 140 },
    { name: 'Experience', x: 250 },
    { name: 'Budget', x: 360 },
    { name: 'Personalizer', x: 470 },
  ].map((n) => ({ ...n, y: L2_Y }))
  // Centre the coordinator above the middle of the row (Experience).
  const L1 = { x: L2[2]!.x + L2_W / 2, y: 60 }
  // L3 nodes, 64 wide, positioned under their parent.
  const L3_W = 64
  const L3_Y = 340
  const L3 = [
    { parent: 0, name: 'plan', offset: -20 },
    { parent: 0, name: 'search', offset: 36 },
    { parent: 2, name: 'insider', offset: -24 },
    { parent: 2, name: 'tier-rank', offset: 32 },
    { parent: 4, name: 'narrative', offset: 18 },
  ].map((c) => ({
    ...c,
    x: L2[c.parent]!.x + L2_W / 2 - L3_W / 2 + c.offset,
    y: L3_Y,
  }))

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      <motion.text x={40} y={30} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE} variants={fadeUp}>
        AGENT HIERARCHY · agent-as-tool
      </motion.text>

      {/* L1 → L2 connectors — drawn AFTER L2 nodes settle. */}
      {L2.map((n, i) => (
        <g key={`l1l2-${i}`}>
          <motion.path
            d={`M ${L1.x} ${L1.y + 34} C ${L1.x} ${120}, ${n.x + L2_W / 2} ${160}, ${n.x + L2_W / 2} ${n.y}`}
            stroke={BORDER}
            strokeWidth={0.8}
            fill="none"
            variants={drawLine}
            style={{ transitionDelay: `${1.0 + i * 0.08}s` }}
          />
          <path
            d={`M ${L1.x} ${L1.y + 34} C ${L1.x} ${120}, ${n.x + L2_W / 2} ${160}, ${n.x + L2_W / 2} ${n.y}`}
            stroke={ACCENT}
            strokeWidth={1.1}
            strokeDasharray="2 6"
            fill="none"
            strokeOpacity={0.7}
            filter="url(#glow)"
            style={{ animation: `flowDash ${3.15 + i * 0.26}s linear infinite` }}
          />
        </g>
      ))}

      {/* L2 → L3 connectors — drawn AFTER L3 nodes settle. */}
      {L3.map((c, i) => {
        const parent = L2[c.parent]!
        const px = parent.x + L2_W / 2
        const cx = c.x + L3_W / 2
        return (
          <g key={`l2l3-${i}`}>
            <motion.path
              d={`M ${px} ${parent.y + 34} C ${px} ${parent.y + 72}, ${cx} ${c.y - 22}, ${cx} ${c.y}`}
              stroke={BORDER}
              strokeWidth={0.7}
              fill="none"
              variants={drawLine}
              style={{ transitionDelay: `${2.4 + i * 0.1}s` }}
            />
            <path
              d={`M ${px} ${parent.y + 34} C ${px} ${parent.y + 72}, ${cx} ${c.y - 22}, ${cx} ${c.y}`}
              stroke={TRACE}
              strokeWidth={0.9}
              strokeDasharray="2 4"
              fill="none"
              filter="url(#glow)"
              style={{ animation: `flowDash ${3.5 + i * 0.35}s linear infinite` }}
            />
          </g>
        )
      })}

      {/* L1 node — Coordinator */}
      <motion.g variants={popIn}>
        <rect x={L1.x - 70} y={L1.y} width={140} height={40} rx={20} fill={SOFT2} stroke={ACCENT} strokeWidth={1.4} filter="url(#glow)" />
        <circle
          cx={L1.x - 52}
          cy={L1.y + 20}
          r={4}
          fill={ACCENT}
          style={{ animation: 'pulseNode 2.24s ease-in-out infinite' }}
        />
        <text x={L1.x + 10} y={L1.y + 25} fontSize="12" fill={ACCENT} textAnchor="middle" fontWeight={600} letterSpacing="1">
          CONCIERGE
        </text>
      </motion.g>
      <motion.text
        x={L1.x + 76}
        y={L1.y + 25}
        fontSize="9"
        fill={SUBTLE}
        variants={fadeUp}
        style={{ transitionDelay: '0.15s' }}
      >
        L1 · coordinator
      </motion.text>

      {/* L2 nodes — Specialists. Smaller rect width so everything fits the viewBox. */}
      {L2.map((n, i) => (
        <motion.g key={n.name} variants={popIn} style={{ transitionDelay: `${0.4 + i * 0.1}s` }}>
          <rect x={n.x} y={n.y} width={L2_W} height={34} rx={8} fill={SOFT} stroke={BORDER} strokeWidth={0.8} />
          <circle
            cx={n.x + 10}
            cy={n.y + 17}
            r={3}
            fill={TRACE}
            style={{ animation: `pulseNodeSmall ${2.1 + i * 0.14}s ease-in-out infinite` }}
          />
          <text x={n.x + 20} y={n.y + 21} fontSize="10" fill={MUTED} fontWeight={500}>
            {n.name}
          </text>
        </motion.g>
      ))}
      <motion.text x={30} y={250} fontSize="9" fill={SUBTLE} variants={fadeUp} style={{ transitionDelay: '0.5s' }}>
        L2 · specialists
      </motion.text>

      {/* L3 nodes — sub-steps / nested tool workflows */}
      {L3.map((c, i) => (
        <motion.g key={`leaf-${i}`} variants={popIn} style={{ transitionDelay: `${1.9 + i * 0.1}s` }}>
          <rect x={c.x} y={c.y} width={L3_W} height={22} rx={6} fill="transparent" stroke={TRACE} strokeWidth={0.7} strokeDasharray="2 3" />
          <text x={c.x + L3_W / 2} y={c.y + 14} fontSize="9" fill={TRACE} textAnchor="middle" fontFamily="Geist Mono, ui-monospace, monospace">
            {c.name}
          </text>
        </motion.g>
      ))}
      <motion.text x={30} y={376} fontSize="9" fill={SUBTLE} variants={fadeUp} style={{ transitionDelay: '1.1s' }}>
        L3 · nested workflows
      </motion.text>

      {/* Bottom legend */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.3s' }}>
        <line x1={40} y1={420} x2={560} y2={420} stroke={BORDER} strokeWidth={0.5} strokeDasharray="2 4" />
        <text x={40} y={444} fontSize="11" fill={MUTED}>
          Any agent can expose sub-agents as tools. The tree is arbitrarily deep; traces bubble up to the root.
        </text>
        <text x={40} y={462} fontSize="10" fill={SUBTLE} fontFamily="Geist Mono, ui-monospace, monospace">
          new LlmAgent({'{ subAgents: [ ... ] }'})
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// Human-in-the-Loop — pause-resume tool call
// ---------------------------------------------------------------------------

export function HitlDiagram() {
  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      <motion.text x={40} y={30} fontSize="10.5" letterSpacing="2.5" fill={SUBTLE} variants={fadeUp}>
        HUMAN-IN-THE-LOOP · request_approval
      </motion.text>

      {/* Timeline spine */}
      <motion.line
        x1={60}
        y1={170}
        x2={560}
        y2={170}
        stroke={BORDER}
        strokeWidth={0.7}
        strokeDasharray="2 4"
        variants={fadeUp}
      />

      {/* Stages along the spine */}
      {[
        { x: 60, label: 'agent\nturn starts', color: MUTED },
        { x: 200, label: 'tool call\nrequest_approval', color: ACCENT, active: true },
        { x: 340, label: 'PAUSED\nawaiting human', color: TRACE, pulse: true },
        { x: 460, label: 'click Approve\n/ Not yet', color: ACCENT },
        { x: 560, label: 'turn resumes', color: MUTED },
      ].map((p, i) => (
        <motion.g key={i} variants={popIn} style={{ transitionDelay: `${0.2 + i * 0.1}s` }}>
          <circle
            cx={p.x}
            cy={170}
            r={p.active ? 7 : 5}
            fill={p.color}
            filter={p.pulse || p.active ? 'url(#glow)' : undefined}
            style={p.pulse ? { animation: 'pulseNode 1.82s ease-in-out infinite' } : undefined}
          />
          {(p.label.split('\n')).map((ln, li) => (
            <text
              key={li}
              x={p.x}
              y={190 + li * 13}
              fontSize="10"
              fill={p.color}
              textAnchor="middle"
              fontWeight={p.active ? 600 : 400}
            >
              {ln}
            </text>
          ))}
        </motion.g>
      ))}

      {/* Flowing animation on the spine showing the pause region */}
      <line
        x1={200}
        y1={170}
        x2={460}
        y2={170}
        stroke={ACCENT}
        strokeWidth={1.3}
        strokeDasharray="3 6"
        strokeOpacity={0.75}
        filter="url(#glow)"
        style={{ animation: 'flowDash 3.85s linear infinite' }}
      />

      {/* Above: the model's stream */}
      <motion.text x={60} y={96} fontSize="10" letterSpacing="2" fill={SUBTLE} variants={fadeUp}>
        MODEL STREAM
      </motion.text>
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.1s' }}>
        <rect x={60} y={106} width={500} height={28} rx={6} fill={SOFT} stroke={BORDER} strokeWidth={0.6} />
        <rect x={60} y={106} width={140} height={28} rx={6} fill={`color-mix(in oklab, ${MUTED} 22%, transparent)`} />
        <rect x={200} y={106} width={140} height={28} rx={0} fill={`color-mix(in oklab, ${ACCENT} 18%, transparent)`} filter="url(#glow)" />
        <rect x={340} y={106} width={120} height={28} fill="transparent" />
        <text x={340 + 60} y={125} fontSize="9.5" fill={TRACE} textAnchor="middle" letterSpacing="2">
          ⏸ PAUSED
        </text>
        <rect x={460} y={106} width={100} height={28} rx={6} fill={`color-mix(in oklab, ${MUTED} 22%, transparent)`} />
      </motion.g>

      {/* Below: approval card mock */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.9s' }}>
        <rect x={160} y={268} width={280} height={120} rx={12} fill={SOFT2} stroke={ACCENT} strokeWidth={1.2} filter="url(#glow)" />
        <rect x={160} y={268} width={280} height={2} rx={2} fill={ACCENT} opacity={0.8} filter="url(#glow)" />
        <text x={174} y={290} fontSize="8.5" fill={SUBTLE} letterSpacing="1.8">
          A2UI · approval_request
        </text>
        <text x={174} y={310} fontSize="12" fill="white" fontWeight={600} className="display">
          Confirm arrangement
        </text>
        <text x={174} y={328} fontSize="10" fill={MUTED}>
          Hold pit-lane walk + Trophy hospitality · ₹27.41L
        </text>
        <rect x={174} y={344} width={94} height={28} rx={6} fill={SOFT} stroke={BORDER} />
        <text x={221} y={362} fontSize="10" fill={MUTED} textAnchor="middle">
          Not yet
        </text>
        <rect x={280} y={344} width={144} height={28} rx={6} fill={ACCENT} filter="url(#glow)" />
        <text x={352} y={362} fontSize="10.5" fill="oklch(16% 0 0)" textAnchor="middle" fontWeight={600}>
          Approve and proceed
        </text>
      </motion.g>

      {/* Legend */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.2s' }}>
        <text x={40} y={440} fontSize="11" fill={MUTED}>
          The agent turn is a normal tool loop. HITL is one more async tool.
        </text>
        <text x={40} y={458} fontSize="10" fill={SUBTLE} fontFamily="Geist Mono, ui-monospace, monospace">
          const {'{'} approved {'}'} = await hitlBus.await(requestId)
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// Context discipline: bar fill + compaction
// ---------------------------------------------------------------------------

export function ContextDiagram() {
  const before = [12, 18, 9, 14, 22, 16, 10, 8, 30, 24, 20]
  const after = [0, 0, 0, 0, 0, 0, 0, 0, 30, 24, 20]
  const summaryWidth = 44
  const total = before.reduce((a, b) => a + b, 0)
  const budget = 200
  const compactedTotal = after.reduce((a, b) => a + b, 0) + summaryWidth

  return (
    <motion.svg viewBox="0 0 600 480" className="w-full h-auto" initial="hidden" animate="show">
      <Defs />

      {/* Before */}
      <motion.text x={40} y={44} fontSize="10.5" letterSpacing="2.2" fill={SUBTLE} variants={fadeUp}>
        BEFORE COMPACTION · 30% of budget
      </motion.text>
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.1s' }}>
        <rect x={40} y={58} width={520} height={26} rx={6} fill={SOFT} stroke={BORDER} />
        {before.reduce<{ x: number; bars: { x: number; w: number }[] }>(
          (acc, w) => ({ x: acc.x + w, bars: [...acc.bars, { x: acc.x, w }] }),
          { x: 0, bars: [] },
        ).bars.map((b, i) => (
          <rect
            key={i}
            x={40 + b.x * (520 / budget)}
            y={58}
            width={b.w * (520 / budget) - 0.8}
            height={26}
            rx={2}
            fill={MUTED}
            opacity={0.3 + i * 0.055}
          />
        ))}
        <text x={560} y={76} fontSize="10" fill={SUBTLE} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
          {total}k / {budget}k
        </text>
      </motion.g>

      {/* Compaction event */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.6s' }}>
        <text x={40} y={138} fontSize="10.5" letterSpacing="2.2" fill={TRACE}>
          RUNNER EMITS
        </text>
        <rect
          x={40}
          y={150}
          width={260}
          height={44}
          rx={10}
          fill={`color-mix(in oklab, ${TRACE} 16%, transparent)`}
          stroke={TRACE}
          strokeWidth={1}
          filter="url(#glow)"
        />
        <circle
          cx={60}
          cy={172}
          r={4}
          fill={TRACE}
          style={{ animation: 'pulseNodeSmall 2.24s ease-in-out infinite' }}
        />
        <text x={80} y={178} fontSize="12" fill={TRACE} fontFamily="Geist Mono, ui-monospace, monospace">
          context · compact (−120k)
        </text>
      </motion.g>

      {/* Connecting arrow from event to "after" bar */}
      <path
        d="M 170 196 L 170 234"
        stroke={TRACE}
        strokeWidth={1.2}
        strokeDasharray="2 5"
        fill="none"
        filter="url(#glow)"
        markerEnd="url(#arTrace)"
        style={{ animation: 'flowDash 2.80s linear infinite' }}
      />

      {/* After */}
      <motion.text x={40} y={248} fontSize="10.5" letterSpacing="2.2" fill={SUBTLE} variants={fadeUp} style={{ transitionDelay: '0.9s' }}>
        AFTER COMPACTION · old turns folded into summary
      </motion.text>
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.0s' }}>
        <rect x={40} y={264} width={520} height={26} rx={6} fill={SOFT} stroke={BORDER} />
        {/* Summary block — glowing */}
        <rect
          x={40}
          y={264}
          width={summaryWidth * (520 / budget)}
          height={26}
          rx={2}
          fill={ACCENT}
          opacity={0.9}
          filter="url(#glow)"
        />
        <text x={40 + (summaryWidth * (520 / budget)) / 2} y={282} fontSize="8.5" fill={SOFT} textAnchor="middle" fontWeight={600}>
          SUMMARY
        </text>
        {after
          .filter((w) => w > 0)
          .reduce<{ x: number; bars: { x: number; w: number }[] }>(
            (acc, w) => ({ x: acc.x + w, bars: [...acc.bars, { x: acc.x, w }] }),
            { x: summaryWidth, bars: [] },
          )
          .bars.map((b, i) => (
            <rect
              key={i}
              x={40 + b.x * (520 / budget)}
              y={264}
              width={b.w * (520 / budget) - 0.8}
              height={26}
              rx={2}
              fill={TRACE}
              opacity={0.9}
            />
          ))}
        <text
          x={560}
          y={282}
          fontSize="10"
          fill={SUBTLE}
          textAnchor="end"
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          {compactedTotal}k / {budget}k
        </text>
      </motion.g>

      <motion.g variants={fadeUp} style={{ transitionDelay: '1.4s' }}>
        <text x={40} y={352} fontSize="10.5" letterSpacing="2.2" fill={SUBTLE}>
          THE MATH
        </text>
        <text x={40} y={374} fontSize="11.5" fill={MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
          approxTokens(text) = Math.ceil(text.length / 4)
        </text>
        <text x={40} y={396} fontSize="11.5" fill={MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
          trigger: used / budget {'>'} 0.30
        </text>
        <text x={40} y={418} fontSize="11.5" fill={MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
          keep: last 6 turns · fold the rest into priorSummary
        </text>
      </motion.g>
    </motion.svg>
  )
}
