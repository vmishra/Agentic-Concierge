/**
 * Animated SVG diagrams for the Architecture Tour.
 *
 * Each diagram is a self-contained, on-mount-animated illustration of one
 * concept — kept restrained, monochrome except for the single champagne
 * accent and a muted trace-teal. No gradients, no emoji, no icons inside.
 */

import { motion } from 'motion/react'
import type { Variants } from 'motion/react'

const ACCENT = 'oklch(78% 0.12 85)'
const TRACE = 'oklch(68% 0.075 200)'
const SOFT = 'oklch(24% 0.014 260)'
const BORDER = 'oklch(34% 0.014 260)'
const MUTED = 'oklch(68% 0.010 260)'
const SUBTLE = 'oklch(52% 0.010 260)'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
}

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

// ---------------------------------------------------------------------------
// 01 — Overture: radial nodegraph
// ---------------------------------------------------------------------------

export function OvertureDiagram() {
  const spokes = [
    { label: 'Researcher', angle: -90, short: 'R' },
    { label: 'Logistics', angle: -30, short: 'L' },
    { label: 'Experience', angle: 30, short: 'E' },
    { label: 'Budget', angle: 90, short: 'B' },
    { label: 'Personalizer', angle: 150, short: 'P' },
  ]
  const cx = 260
  const cy = 210
  const R = 140
  const pos = (angle: number) => ({
    x: cx + Math.cos((angle - 180) * (Math.PI / 180)) * R,
    y: cy + Math.sin((angle - 180) * (Math.PI / 180)) * R,
  })

  return (
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      {/* concentric orbit guides */}
      {[1, 2, 3].map((k) => (
        <motion.circle
          key={k}
          cx={cx}
          cy={cy}
          r={60 * k}
          fill="none"
          stroke={BORDER}
          strokeWidth={0.6}
          strokeDasharray="2 4"
          variants={fadeUp}
        />
      ))}

      {/* spoke lines from concierge to each specialist */}
      {spokes.map((s, i) => {
        const p = pos(s.angle)
        return (
          <motion.line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke={BORDER}
            strokeWidth={1}
            variants={drawLine}
            style={{ transitionDelay: `${0.2 + i * 0.06}s` }}
          />
        )
      })}

      {/* orbit layer labels */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.5s' }}>
        <text x={cx + 8} y={cy - 182} fontSize="9" fill={SUBTLE} letterSpacing="2">
          MEMORY
        </text>
        <text x={cx + 8} y={cy - 122} fontSize="9" fill={SUBTLE} letterSpacing="2">
          SKILLS
        </text>
        <text x={cx + 8} y={cy - 62} fontSize="9" fill={SUBTLE} letterSpacing="2">
          TOOLS
        </text>
      </motion.g>

      {/* specialist nodes */}
      {spokes.map((s, i) => {
        const p = pos(s.angle)
        return (
          <motion.g key={s.label} variants={popIn} style={{ transitionDelay: `${0.35 + i * 0.06}s` }}>
            <circle cx={p.x} cy={p.y} r={26} fill={SOFT} stroke={BORDER} strokeWidth={1} />
            <circle cx={p.x} cy={p.y} r={4} fill={TRACE} />
            <text
              x={p.x}
              y={p.y + 46}
              fontSize="11"
              fill={MUTED}
              textAnchor="middle"
              fontWeight={500}
            >
              {s.label}
            </text>
          </motion.g>
        )
      })}

      {/* Concierge core */}
      <motion.g variants={popIn}>
        <circle cx={cx} cy={cy} r={44} fill={SOFT} stroke={ACCENT} strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={8} fill={ACCENT} />
        <text
          x={cx}
          y={cy + 64}
          fontSize="11"
          letterSpacing="2"
          fill={ACCENT}
          textAnchor="middle"
          fontWeight={600}
        >
          CONCIERGE
        </text>
      </motion.g>

      {/* user ingress */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.8s' }}>
        <text x={30} y={cy + 4} fontSize="10" fill={SUBTLE} letterSpacing="1">
          user
        </text>
        <motion.path
          d={`M 58 ${cy} L ${cx - 52} ${cy}`}
          stroke={ACCENT}
          strokeWidth={1}
          fill="none"
          markerEnd="url(#ar)"
          variants={drawLine}
        />
      </motion.g>

      <defs>
        <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
        </marker>
      </defs>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 02 — Skills: skill attaches, tools appear in toolbelt
// ---------------------------------------------------------------------------

export function SkillsDiagram() {
  const skills = ['event-catalog', 'hospitality-tiers', 'travel-logistics', 'dietary-accessibility', 'gifting-narrative']
  const activated = 1 // which one "attaches"

  return (
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      {/* Agent box */}
      <motion.g variants={fadeUp}>
        <rect x={190} y={60} width={140} height={72} rx={10} fill={SOFT} stroke={BORDER} />
        <text x={260} y={88} fontSize="11" letterSpacing="2" fill={ACCENT} textAnchor="middle" fontWeight={600}>
          AGENT
        </text>
        <text x={260} y={108} fontSize="10" fill={SUBTLE} textAnchor="middle">
          slim system prompt
        </text>
        <text x={260} y={122} fontSize="10" fill={SUBTLE} textAnchor="middle">
          ↓ pulls as needed
        </text>
      </motion.g>

      {/* Toolbelt */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.2s' }}>
        <text x={260} y={168} fontSize="9" letterSpacing="2" fill={SUBTLE} textAnchor="middle">
          ACTIVE TOOLBELT
        </text>
      </motion.g>

      {/* Attached tools (appear after skill activates) */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.9s' }}>
        {['tiers_for_event', 'tier_detail'].map((t, i) => (
          <motion.g key={t} variants={popIn} style={{ transitionDelay: `${1.0 + i * 0.1}s` }}>
            <rect
              x={190 + i * 80}
              y={180}
              width={72}
              height={28}
              rx={14}
              fill={`color-mix(in oklab, ${TRACE} 14%, transparent)`}
              stroke={TRACE}
              strokeWidth={0.8}
            />
            <text x={190 + i * 80 + 36} y={198} fontSize="10" fill={TRACE} textAnchor="middle" fontWeight={500}>
              {t}
            </text>
          </motion.g>
        ))}
      </motion.g>

      {/* Skills row */}
      {skills.map((s, i) => {
        const x = 20 + i * 100
        const isActive = i === activated
        return (
          <motion.g key={s} variants={fadeUp} style={{ transitionDelay: `${0.35 + i * 0.08}s` }}>
            <rect
              x={x}
              y={300}
              width={92}
              height={60}
              rx={10}
              fill={SOFT}
              stroke={isActive ? ACCENT : BORDER}
              strokeWidth={isActive ? 1.5 : 0.8}
              strokeDasharray={isActive ? '0' : '2 3'}
            />
            <text x={x + 46} y={322} fontSize="9" fill={SUBTLE} textAnchor="middle" letterSpacing="1.5">
              SKILL
            </text>
            <text
              x={x + 46}
              y={342}
              fontSize="10"
              fill={isActive ? ACCENT : MUTED}
              textAnchor="middle"
              fontWeight={500}
            >
              {s.split('-')[0]}
            </text>
            <text x={x + 46} y={354} fontSize="9" fill={SUBTLE} textAnchor="middle">
              {s.split('-').slice(1).join(' ') || '·'}
            </text>
          </motion.g>
        )
      })}

      {/* Activation line from active skill → agent */}
      <motion.path
        d={`M ${20 + activated * 100 + 46} 300 Q 260 250 260 210`}
        stroke={ACCENT}
        strokeWidth={1.2}
        strokeDasharray="3 3"
        fill="none"
        variants={drawLine}
        style={{ transitionDelay: '0.85s' }}
      />
      <motion.text
        x={300}
        y={256}
        fontSize="10"
        fill={ACCENT}
        variants={fadeUp}
        style={{ transitionDelay: '1.05s' }}
      >
        skill · load
      </motion.text>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 03 — Tools: manifest → lazy load → execute
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
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      <motion.text
        x={40}
        y={36}
        fontSize="10"
        letterSpacing="2.5"
        fill={SUBTLE}
        variants={fadeUp}
      >
        TOOL CATALOG
      </motion.text>

      {manifests.map((m, i) => {
        const row = Math.floor(i / 2)
        const col = i % 2
        const x = 40 + col * 230
        const y = 54 + row * 52
        return (
          <motion.g key={m.name} variants={fadeUp} style={{ transitionDelay: `${0.1 + i * 0.06}s` }}>
            <rect
              x={x}
              y={y}
              width={210}
              height={40}
              rx={8}
              fill={m.loaded ? `color-mix(in oklab, ${TRACE} 12%, transparent)` : SOFT}
              stroke={m.loaded ? TRACE : BORDER}
              strokeWidth={m.loaded ? 1 : 0.6}
              strokeDasharray={m.loaded ? '0' : '2 3'}
            />
            <circle cx={x + 16} cy={y + 20} r={3.5} fill={m.loaded ? TRACE : BORDER} />
            <text x={x + 30} y={y + 24} fontSize="11" fill={m.loaded ? TRACE : MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
              {m.name}
            </text>
            <text x={x + 196} y={y + 24} fontSize="9" fill={SUBTLE} textAnchor="end" letterSpacing="1">
              {m.loaded ? 'LOADED' : 'manifest'}
            </text>
          </motion.g>
        )
      })}

      <motion.g variants={fadeUp} style={{ transitionDelay: '0.85s' }}>
        <text x={40} y={348} fontSize="10" letterSpacing="2.5" fill={SUBTLE}>
          PARALLEL FAN-OUT
        </text>
        <rect x={40} y={358} width={440} height={44} rx={10} fill={SOFT} stroke={BORDER} />
        <text x={60} y={384} fontSize="11" fill={MUTED} fontFamily="Geist Mono, ui-monospace, monospace">
          await Promise.all(calls.map(c ={'>'} catalog.call(c, ctx)))
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 04 — Memory: write + cosine recall
// ---------------------------------------------------------------------------

export function MemoryDiagram() {
  const facts = [
    { text: 'prefers business-class flights', y: 122, match: 0.22 },
    { text: 'travels in groups of four', y: 166, match: 0.18 },
    { text: 'partner is vegan', y: 210, match: 0.71 },
    { text: 'gluten-free request for guest 3', y: 254, match: 0.64 },
  ]

  return (
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      {/* Query */}
      <motion.g variants={fadeUp}>
        <rect x={40} y={40} width={200} height={46} rx={10} fill={SOFT} stroke={ACCENT} />
        <text x={54} y={60} fontSize="9" letterSpacing="2" fill={SUBTLE}>
          QUERY
        </text>
        <text x={54} y={76} fontSize="12" fill={ACCENT} fontFamily="Geist Mono, ui-monospace, monospace">
          "dietary preferences"
        </text>
      </motion.g>

      {/* Store */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.2s' }}>
        <rect x={280} y={88} width={200} height={196} rx={12} fill={SOFT} stroke={BORDER} />
        <text x={292} y={110} fontSize="9" letterSpacing="2" fill={SUBTLE}>
          LONG-TERM MEMORY
        </text>
      </motion.g>

      {facts.map((f, i) => {
        const isHit = f.match > 0.5
        return (
          <motion.g
            key={i}
            variants={fadeUp}
            style={{ transitionDelay: `${0.35 + i * 0.08}s` }}
          >
            <rect
              x={292}
              y={f.y}
              width={176}
              height={28}
              rx={6}
              fill={isHit ? `color-mix(in oklab, ${ACCENT} 15%, transparent)` : 'transparent'}
              stroke={isHit ? ACCENT : BORDER}
              strokeWidth={isHit ? 1 : 0.5}
            />
            <text x={302} y={f.y + 18} fontSize="11" fill={isHit ? ACCENT : MUTED}>
              {f.text}
            </text>
            <text x={460} y={f.y + 18} fontSize="9" fill={isHit ? ACCENT : SUBTLE} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
              {f.match.toFixed(2)}
            </text>
          </motion.g>
        )
      })}

      {/* similarity arcs from query to hits */}
      {facts
        .filter((f) => f.match > 0.5)
        .map((f, i) => (
          <motion.path
            key={`arc-${i}`}
            d={`M 240 64 C 270 64, 270 ${f.y + 14}, 290 ${f.y + 14}`}
            stroke={ACCENT}
            strokeWidth={0.9}
            fill="none"
            variants={drawLine}
            style={{ transitionDelay: `${0.7 + i * 0.15}s` }}
          />
        ))}

      <motion.g variants={fadeUp} style={{ transitionDelay: '1.2s' }}>
        <text x={40} y={340} fontSize="9" letterSpacing="2" fill={SUBTLE}>
          INJECTED INTO PROMPT
        </text>
        <rect x={40} y={352} width={440} height={44} rx={8} fill={SOFT} stroke={BORDER} strokeDasharray="2 3" />
        <text x={54} y={378} fontSize="11" fill={MUTED}>
          Known preferences: partner is vegan · gluten-free request for guest 3
        </text>
      </motion.g>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 05 — A2UI: JSON → rendered card
// ---------------------------------------------------------------------------

export function A2UIDiagram() {
  return (
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      {/* Left: JSON */}
      <motion.g variants={fadeUp}>
        <text x={40} y={36} fontSize="10" letterSpacing="2.5" fill={SUBTLE}>
          AGENT EMITS
        </text>
        <rect x={40} y={46} width={220} height={340} rx={10} fill={SOFT} stroke={BORDER} />
      </motion.g>

      {[
        { t: '{', x: 54, y: 70, c: MUTED },
        { t: '"kind": "option_card_grid",', x: 62, y: 90, c: ACCENT },
        { t: '"title": "Three hotels,"', x: 62, y: 108, c: MUTED },
        { t: '"columns": 3,', x: 62, y: 126, c: MUTED },
        { t: '"options": [', x: 62, y: 144, c: MUTED },
        { t: '{ "title": "Waldorf Astoria",', x: 78, y: 162, c: MUTED },
        { t: '  "price": 95000,', x: 78, y: 178, c: MUTED },
        { t: '  "badges": ["step-free"] },', x: 78, y: 194, c: MUTED },
        { t: '{ "title": "Ritz-Carlton" },', x: 78, y: 212, c: MUTED },
        { t: '{ "title": "Emirates Palace" }', x: 78, y: 230, c: MUTED },
        { t: '],', x: 62, y: 248, c: MUTED },
        { t: '"refinements": [', x: 62, y: 266, c: MUTED },
        { t: '{ "label": "Compare" },', x: 78, y: 284, c: TRACE },
        { t: '{ "label": "Quieter" }', x: 78, y: 302, c: TRACE },
        { t: ']', x: 62, y: 320, c: MUTED },
        { t: '}', x: 54, y: 338, c: MUTED },
      ].map((l, i) => (
        <motion.text
          key={i}
          x={l.x}
          y={l.y}
          fontSize="10.5"
          fill={l.c}
          fontFamily="Geist Mono, ui-monospace, monospace"
          variants={fadeUp}
          style={{ transitionDelay: `${0.1 + i * 0.02}s` }}
        >
          {l.t}
        </motion.text>
      ))}

      {/* Arrow */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.7s' }}>
        <path d="M 268 216 L 300 216" stroke={ACCENT} strokeWidth={1.2} markerEnd="url(#ar2)" />
        <text x={284} y={208} fontSize="9" fill={ACCENT} textAnchor="middle" letterSpacing="1.5">
          render
        </text>
      </motion.g>

      {/* Right: mock card */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.85s' }}>
        <rect x={308} y={46} width={180} height={340} rx={10} fill={SOFT} stroke={BORDER} />
        <text x={322} y={68} fontSize="9" letterSpacing="2" fill={SUBTLE}>
          RENDERED A2UI
        </text>
        <text x={322} y={92} fontSize="12" fill="white" fontWeight={600}>
          Three hotels
        </text>

        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(322, ${112 + i * 74})`}>
            <rect width={152} height={64} rx={6} fill="oklch(22% 0.014 260)" stroke={BORDER} />
            <text x={10} y={18} fontSize="7" fill={SUBTLE} letterSpacing="1">
              {['FIVE-STAR', 'FIVE-STAR', 'PALACE'][i]}
            </text>
            <text x={10} y={32} fontSize="10" fill={MUTED} fontWeight={500}>
              {['Waldorf Astoria', 'Ritz-Carlton', 'Emirates Palace'][i]}
            </text>
            <rect x={10} y={40} width={46} height={14} rx={7} fill={`color-mix(in oklab, ${TRACE} 14%, transparent)`} />
            <text x={14} y={50} fontSize="8" fill={TRACE}>
              step-free
            </text>
            <text x={144} y={50} fontSize="10" fill={ACCENT} textAnchor="end" fontWeight={500}>
              {['₹0.95L', '₹0.78L', '₹1.68L'][i]}
            </text>
          </g>
        ))}
      </motion.g>

      <defs>
        <marker id="ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
        </marker>
      </defs>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 06 — Runner: a single turn's flow
// ---------------------------------------------------------------------------

export function RunnerDiagram() {
  const steps = [
    { label: 'assemble prompt', sub: 'system + skills + memory' },
    { label: 'compact if >30%', sub: 'roll old turns → summary' },
    { label: 'provider.generate', sub: 'stream chunks' },
    { label: 'tool calls?', sub: 'Promise.all fan-out', decision: true },
    { label: 'sub-agent?', sub: 'dispatch with new session', decision: true },
    { label: 'loop until done', sub: 'provider says stop' },
    { label: 'afterModel callback', sub: 'trace · artifact' },
  ]

  return (
    <motion.svg viewBox="0 0 520 460" className="w-full h-auto" initial="hidden" animate="show">
      <motion.text x={40} y={30} fontSize="10" letterSpacing="2.5" fill={SUBTLE} variants={fadeUp}>
        run() · ONE TURN
      </motion.text>

      {steps.map((s, i) => {
        const y = 50 + i * 54
        return (
          <motion.g key={i} variants={fadeUp} style={{ transitionDelay: `${0.1 + i * 0.08}s` }}>
            <rect
              x={40}
              y={y}
              width={440}
              height={40}
              rx={s.decision ? 20 : 8}
              fill={SOFT}
              stroke={s.decision ? ACCENT : BORDER}
              strokeWidth={s.decision ? 1 : 0.7}
            />
            <text x={56} y={y + 18} fontSize="8" fill={SUBTLE} letterSpacing="2">
              {String(i + 1).padStart(2, '0')}
            </text>
            <text x={80} y={y + 18} fontSize="12" fill={s.decision ? ACCENT : MUTED} fontWeight={500}>
              {s.label}
            </text>
            <text x={80} y={y + 32} fontSize="10" fill={SUBTLE}>
              {s.sub}
            </text>

            {/* connector line */}
            {i < steps.length - 1 ? (
              <motion.line
                x1={260}
                y1={y + 42}
                x2={260}
                y2={y + 50}
                stroke={BORDER}
                strokeWidth={0.8}
                variants={drawLine}
              />
            ) : null}
          </motion.g>
        )
      })}

      {/* loop-back arc */}
      <motion.path
        d="M 480 272 Q 510 272, 510 218 Q 510 164, 480 164"
        stroke={TRACE}
        strokeWidth={1}
        strokeDasharray="3 3"
        fill="none"
        variants={drawLine}
        style={{ transitionDelay: '0.9s' }}
      />
      <motion.text
        x={502}
        y={218}
        fontSize="9"
        fill={TRACE}
        textAnchor="middle"
        variants={fadeUp}
        style={{ transitionDelay: '1.1s' }}
      >
        loop
      </motion.text>
    </motion.svg>
  )
}

// ---------------------------------------------------------------------------
// 07 — Context discipline: bar fills + compaction event
// ---------------------------------------------------------------------------

export function ContextDiagram() {
  const before = [12, 18, 9, 14, 22, 16, 10, 8, 30, 24, 20]
  const after = [0, 0, 0, 0, 0, 0, 0, 0, 30, 24, 20]
  const summaryWidth = 44
  const total = before.reduce((a, b) => a + b, 0)
  const budget = 200
  const compactedTotal = after.reduce((a, b) => a + b, 0) + summaryWidth

  return (
    <motion.svg viewBox="0 0 520 420" className="w-full h-auto" initial="hidden" animate="show">
      {/* Before */}
      <motion.text x={40} y={40} fontSize="10" letterSpacing="2" fill={SUBTLE} variants={fadeUp}>
        BEFORE COMPACTION · 30% of budget
      </motion.text>
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.1s' }}>
        <rect x={40} y={54} width={440} height={20} rx={4} fill={SOFT} stroke={BORDER} />
        {before.reduce<{ x: number; bars: { x: number; w: number }[] }>(
          (acc, w) => ({ x: acc.x + w, bars: [...acc.bars, { x: acc.x, w }] }),
          { x: 0, bars: [] },
        ).bars.map((b, i) => (
          <rect
            key={i}
            x={40 + b.x * (440 / budget)}
            y={54}
            width={b.w * (440 / budget) - 0.8}
            height={20}
            rx={2}
            fill={MUTED}
            opacity={0.3 + i * 0.055}
          />
        ))}
        <text x={480} y={68} fontSize="9" fill={SUBTLE} textAnchor="end" fontFamily="Geist Mono, ui-monospace, monospace">
          {total}k / {budget}k
        </text>
      </motion.g>

      {/* Event */}
      <motion.g variants={fadeUp} style={{ transitionDelay: '0.6s' }}>
        <text x={40} y={120} fontSize="10" letterSpacing="2" fill={TRACE}>
          RUNNER EMITS
        </text>
        <rect
          x={40}
          y={130}
          width={220}
          height={38}
          rx={6}
          fill={`color-mix(in oklab, ${TRACE} 12%, transparent)`}
          stroke={TRACE}
        />
        <text x={54} y={154} fontSize="11" fill={TRACE} fontFamily="Geist Mono, ui-monospace, monospace">
          context · compact (−120k)
        </text>
      </motion.g>

      {/* After */}
      <motion.text x={40} y={214} fontSize="10" letterSpacing="2" fill={SUBTLE} variants={fadeUp} style={{ transitionDelay: '0.9s' }}>
        AFTER COMPACTION · old turns folded into summary
      </motion.text>
      <motion.g variants={fadeUp} style={{ transitionDelay: '1.0s' }}>
        <rect x={40} y={228} width={440} height={20} rx={4} fill={SOFT} stroke={BORDER} />
        {/* Compact summary block */}
        <rect
          x={40}
          y={228}
          width={summaryWidth * (440 / budget)}
          height={20}
          rx={2}
          fill={ACCENT}
          opacity={0.85}
        />
        <text x={40 + (summaryWidth * (440 / budget)) / 2} y={242} fontSize="8" fill={SOFT} textAnchor="middle" fontWeight={600}>
          SUMMARY
        </text>
        {/* Remaining live turns */}
        {after
          .filter((w) => w > 0)
          .reduce<{ x: number; bars: { x: number; w: number }[] }>(
            (acc, w) => ({ x: acc.x + w, bars: [...acc.bars, { x: acc.x, w }] }),
            { x: summaryWidth, bars: [] },
          )
          .bars.map((b, i) => (
            <rect
              key={i}
              x={40 + b.x * (440 / budget)}
              y={228}
              width={b.w * (440 / budget) - 0.8}
              height={20}
              rx={2}
              fill={TRACE}
              opacity={0.9}
            />
          ))}
        <text
          x={480}
          y={242}
          fontSize="9"
          fill={SUBTLE}
          textAnchor="end"
          fontFamily="Geist Mono, ui-monospace, monospace"
        >
          {compactedTotal}k / {budget}k
        </text>
      </motion.g>

      <motion.g variants={fadeUp} style={{ transitionDelay: '1.4s' }}>
        <text x={40} y={304} fontSize="10" letterSpacing="2" fill={SUBTLE}>
          THE MATH
        </text>
        <text x={40} y={324} fontSize="11" fill={MUTED}>
          approxTokens(text) = Math.ceil(text.length / 4)
        </text>
        <text x={40} y={346} fontSize="11" fill={MUTED}>
          trigger: used / budget {'>'} 0.30
        </text>
        <text x={40} y={368} fontSize="11" fill={MUTED}>
          keep: last 6 turns live · fold the rest into priorSummary
        </text>
      </motion.g>
    </motion.svg>
  )
}
