import type { A2UIArtifact } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'
import { fmtMoney } from '@/lib/format'
import { cn } from '@/lib/cn'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'pricing_breakdown' }> }

export function PricingBreakdown({ artifact }: Props) {
  return (
    <SurfaceCard>
      <CardHeader eyebrow="pricing" title={artifact.title} />
      <dl className="mt-5 flex flex-col gap-0.5">
        {artifact.lines.map((l, i) => (
          <div
            key={i}
            className={cn(
              'flex items-baseline justify-between gap-4 py-2.5 text-[13.5px]',
              i > 0 ? 'border-t border-[color:var(--border)]' : '',
            )}
          >
            <div className="flex flex-col">
              <dt
                className={cn(
                  l.tone === 'accent'
                    ? 'text-[color:var(--accent)] font-medium'
                    : l.tone === 'muted'
                      ? 'text-subtle'
                      : 'text-text',
                )}
              >
                {l.label}
              </dt>
              {l.detail ? <span className="text-[12px] text-subtle leading-relaxed">{l.detail}</span> : null}
            </div>
            <dd className={cn('numeric tabular-nums', l.tone === 'muted' ? 'text-subtle' : 'text-text')}>
              {fmtMoney(l.amount)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-baseline justify-between border-t border-[color:var(--border-strong)] pt-4">
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted">total</span>
        <span className="numeric text-[22px] font-medium tracking-tight">{fmtMoney(artifact.total)}</span>
      </div>
      {artifact.note ? <p className="mt-3 text-[12px] text-subtle leading-relaxed">{artifact.note}</p> : null}
    </SurfaceCard>
  )
}
