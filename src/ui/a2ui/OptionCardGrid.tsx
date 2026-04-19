import type { A2UIArtifact, OptionCard } from '@/adk/a2ui'
import { fmtMoney } from '@/lib/format'
import { cn } from '@/lib/cn'
import { CardHeader, SurfaceCard } from './_common'
import { Chip } from '@/ui/components/Chip'
import { RefinementChips } from './RefinementChips'
import { Check } from 'lucide-react'

type Extract<A extends { kind: string }, K extends A['kind']> = A extends { kind: K } ? A : never

type Props = {
  artifact: Extract<A2UIArtifact, 'option_card_grid'>
  onRefine?: (label: string, prompt?: string) => void
  onSelect?: (artifactId: string, optionId: string) => void
}

export function OptionCardGrid({ artifact, onRefine, onSelect }: Props) {
  const cols = artifact.columns ?? 3
  const grid =
    cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'

  return (
    <SurfaceCard>
      <CardHeader title={artifact.title} subtitle={artifact.subtitle} />
      <div className={cn('mt-5 grid gap-3', grid)}>
        {artifact.options.map((opt) => (
          <OptionTile
            key={opt.id}
            opt={opt}
            onClick={() => onSelect?.(artifact.id, opt.id)}
          />
        ))}
      </div>
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

function OptionTile({ opt, onClick }: { opt: OptionCard; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-3 rounded-[var(--radius-md)] p-4 text-left',
        'bg-elev-2 border border-[color:var(--border)]',
        'transition-[border-color,background-color,transform] duration-150 ease-out',
        'hover:border-[color:var(--border-strong)] hover:bg-[oklch(24%_0.014_260)]',
        opt.selected && 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]',
      )}
    >
      {opt.eyebrow ? (
        <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted font-medium">{opt.eyebrow}</span>
      ) : null}
      <div className="flex flex-col gap-0.5">
        <h4 className="text-[15px] font-medium leading-snug tracking-tight">{opt.title}</h4>
        {opt.subtitle ? <p className="text-[12.5px] text-muted leading-relaxed">{opt.subtitle}</p> : null}
      </div>
      {opt.bullets && opt.bullets.length > 0 ? (
        <ul className="flex flex-col gap-1.5 mt-1">
          {opt.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted leading-relaxed">
              <span aria-hidden className="mt-[7px] size-1 rounded-full bg-[color:var(--border-strong)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {opt.badges && opt.badges.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {opt.badges.map((b, i) => (
            <Chip key={i} tone={b.tone === 'success' ? 'success' : b.tone === 'accent' ? 'accent' : 'neutral'}>
              {b.label}
            </Chip>
          ))}
        </div>
      ) : null}
      {opt.price ? (
        <div className="mt-auto flex items-baseline justify-between pt-2 hairline-t">
          <span className="text-[11px] uppercase tracking-wider text-subtle">{opt.priceNote ?? 'from'}</span>
          <span className="numeric text-[15px] font-medium text-text">{fmtMoney(opt.price)}</span>
        </div>
      ) : null}
      {opt.selected ? (
        <span className="absolute top-3 right-3 flex items-center justify-center size-5 rounded-full bg-[color:var(--accent)] text-[oklch(16%_0_0)]">
          <Check className="size-3" strokeWidth={2.2} />
        </span>
      ) : null}
    </button>
  )
}
