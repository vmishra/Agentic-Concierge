import type { A2UIArtifact, ResearchStep } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'
import { cn } from '@/lib/cn'
import { motion, AnimatePresence } from 'motion/react'
import { spring } from '@/ui/motion/presets'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'research_scratchpad' }> }

const statusLabel: Record<ResearchStep['status'], string> = {
  planning: 'planning',
  searching: 'searching',
  critiquing: 'critiquing',
  refined: 'refined',
}

export function ResearchScratchpad({ artifact }: Props) {
  return (
    <SurfaceCard className="bg-[oklch(17%_0.01_200/0.7)]">
      <CardHeader eyebrow="deep research" title={artifact.title} subtitle={artifact.subtitle} />
      <ol className="mt-5 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {artifact.steps.map((s, i) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: spring }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center pt-1">
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-[10.5px] numeric font-medium',
                    s.status === 'refined'
                      ? 'bg-[color:var(--trace-soft)] text-[color:var(--trace)]'
                      : 'bg-elev-2 text-muted',
                  )}
                >
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-[13.5px] font-medium leading-snug">{s.question}</h4>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--trace)]">
                    {statusLabel[s.status]}
                  </span>
                </div>
                {s.findings ? (
                  <p className="text-[12.5px] text-muted leading-relaxed">{s.findings}</p>
                ) : null}
                {s.sources && s.sources.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {s.sources.map((src, j) => (
                      <span
                        key={j}
                        className="text-[10.5px] text-subtle border border-[color:var(--border)] rounded-full px-2 py-0.5"
                        title={src.hint}
                      >
                        {src.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </SurfaceCard>
  )
}
