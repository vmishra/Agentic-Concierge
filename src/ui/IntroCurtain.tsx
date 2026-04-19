/**
 * IntroCurtain — a quiet overture shown on every hard reload.
 *
 * Breathes, draws a hairline beneath the wordmark, reveals four capability
 * words, then invites the guest to step inside. Enter / space key also
 * triggers. Deliberately not persisted — each demo starts fresh.
 */

import { useEffect } from 'react'
import { motion, type Variants } from 'motion/react'

const fade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

const ruleDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } },
}

export function IntroCurtain({ onEnter }: { onEnter: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter])

  return (
    <motion.div
      role="dialog"
      aria-label="Agent Concierge · welcome"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 50% 48%, oklch(18% 0.05 60 / 0.6), transparent 60%), oklch(10% 0.008 60)',
      }}
    >
      <Ambient />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.25, delayChildren: 0.5 } },
        }}
        className="relative z-10 flex flex-col items-center gap-10 px-6 text-center max-w-[720px]"
      >
        {/* Mark */}
        <motion.div variants={fade} className="relative">
          <Mark />
        </motion.div>

        {/* Kicker */}
        <motion.span
          variants={fade}
          className="text-[10.5px] uppercase tracking-[0.36em] text-subtle font-mono font-medium"
        >
          a quiet service
        </motion.span>

        {/* Wordmark */}
        <motion.h1
          variants={fade}
          className="display text-[58px] md:text-[88px] font-medium leading-[1.0] tracking-[-0.02em] text-text"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          Agent Concierge
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fade}
          className="text-[15.5px] md:text-[17px] text-muted leading-[1.6] max-w-[520px]"
          style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
        >
          A small system of specialists, for the journeys you only take once.
        </motion.p>

        {/* Hairline */}
        <motion.span
          variants={ruleDraw}
          style={{
            originX: 0.5,
            height: 1,
            width: 240,
            background:
              'linear-gradient(90deg, transparent, var(--accent-hairline) 20%, var(--accent-hairline) 80%, transparent)',
          }}
          className="my-1 block"
        />

        {/* Capability words */}
        <motion.div
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.18, delayChildren: 0.15 } },
          }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] uppercase tracking-[0.28em] text-subtle font-mono font-medium"
        >
          {['sourced', 'arranged', 'remembered', 'cared for'].map((w) => (
            <motion.span key={w} variants={fade} className="flex items-center gap-6">
              <span>{w}</span>
              <span aria-hidden className="opacity-40">·</span>
            </motion.span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={fade}
          type="button"
          onClick={onEnter}
          className="group mt-4 inline-flex items-center gap-3 h-11 px-6 rounded-full border text-[13px] font-medium transition-all duration-300 ease-out relative overflow-hidden"
          style={{
            borderColor: 'color-mix(in oklab, var(--accent) 50%, transparent)',
            color: 'var(--accent)',
            letterSpacing: '0.04em',
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                'radial-gradient(circle at 50% 120%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%)',
            }}
          />
          <span className="relative">step inside</span>
          <span className="relative text-subtle opacity-60 group-hover:opacity-100 transition-opacity">
            ↵
          </span>
        </motion.button>

        <motion.span
          variants={fade}
          className="text-[10.5px] uppercase tracking-[0.28em] text-subtle font-mono -mt-2 opacity-60"
        >
          press enter to begin
        </motion.span>
      </motion.div>

      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10.5px] uppercase tracking-[0.28em] text-subtle font-mono font-medium opacity-50"
      >
        powered by Google AI
      </motion.div>
    </motion.div>
  )
}

function Mark() {
  return (
    <div className="relative size-20 flex items-center justify-center">
      {/* Slow outer rings */}
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
            animation: `introBreathe 5.5s ease-in-out infinite`,
            animationDelay: `${i * 1.6}s`,
          }}
        />
      ))}
      {/* Mark */}
      <svg viewBox="0 0 80 80" className="size-16 relative z-10">
        <defs>
          <filter id="intro-mark-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="40"
          cy="40"
          r="22"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.2"
          filter="url(#intro-mark-glow)"
        />
        <circle
          cx="40"
          cy="40"
          r="4.5"
          fill="var(--accent)"
          filter="url(#intro-mark-glow)"
          style={{ animation: 'introPulse 2.4s ease-in-out infinite' }}
        />
      </svg>
      <style>{`
        @keyframes introBreathe {
          0%, 100% { transform: scale(0.96); opacity: 0.18 }
          50% { transform: scale(1.5); opacity: 0 }
        }
        @keyframes introPulse {
          0%, 100% { opacity: 1; transform: scale(1) }
          50% { opacity: 0.72; transform: scale(1.1) }
        }
      `}</style>
    </div>
  )
}

function Ambient() {
  return (
    <>
      {/* Soft grain */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Subtle corner vignette */}
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 120%, transparent 50%, oklch(8% 0.006 60) 100%)',
        }}
      />
    </>
  )
}
