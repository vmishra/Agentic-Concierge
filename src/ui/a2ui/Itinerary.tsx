import type { A2UIArtifact } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'
import { RefinementChips } from './RefinementChips'

type Props = {
  artifact: Extract<A2UIArtifact, { kind: 'itinerary' }>
  onRefine?: (label: string, prompt?: string) => void
}

export function ItineraryCard({ artifact, onRefine }: Props) {
  return (
    <SurfaceCard>
      <CardHeader
        eyebrow="itinerary"
        title={artifact.title}
        subtitle={artifact.subtitle}
      />
      <ol className="mt-5 flex flex-col gap-5">
        {artifact.days.map((day, idx) => (
          <li key={day.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex size-8 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[12.5px] font-medium text-[color:var(--accent)] numeric">
                {idx + 1}
              </span>
              {idx < artifact.days.length - 1 ? (
                <span
                  aria-hidden
                  className="mt-1 w-px flex-1"
                  style={{
                    background:
                      'linear-gradient(to bottom, var(--accent-hairline), transparent)',
                  }}
                />
              ) : null}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-[15px] font-medium leading-snug tracking-tight">{day.title}</h4>
                <span className="text-[11.5px] text-subtle numeric uppercase tracking-wider">{day.date}</span>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {day.blocks.map((b, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-[13px]">
                    <span className="numeric text-subtle w-14 shrink-0">{b.time}</span>
                    <div className="flex flex-col">
                      <span className="text-text">{b.title}</span>
                      {b.subtitle ? (
                        <span className="text-subtle text-[12px] leading-relaxed">{b.subtitle}</span>
                      ) : null}
                    </div>
                    {b.tag ? (
                      <span className="ml-auto text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--accent)]">
                        {b.tag}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      {artifact.refinements && artifact.refinements.length > 0 ? (
        <div className="mt-5">
          <RefinementChips
            artifact={{
              kind: 'refinement_chips',
              id: `${artifact.id}.refs`,
              chips: artifact.refinements,
            }}
            onRefine={onRefine}
            inline
          />
        </div>
      ) : null}
    </SurfaceCard>
  )
}
