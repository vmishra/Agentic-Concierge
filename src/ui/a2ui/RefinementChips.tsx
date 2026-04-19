import type { A2UIArtifact } from '@/adk/a2ui'
import { Chip } from '@/ui/components/Chip'
import { cn } from '@/lib/cn'

type Props = {
  artifact: Extract<A2UIArtifact, { kind: 'refinement_chips' }>
  onRefine?: (label: string, prompt?: string) => void
  inline?: boolean
}

export function RefinementChips({ artifact, onRefine, inline }: Props) {
  return (
    <div className={cn('flex flex-col gap-2', !inline && 'p-5 rounded-[var(--radius-md)] bg-elev-1 border border-[color:var(--border)]')}>
      {artifact.title ? (
        <span className="text-[11px] uppercase tracking-[0.14em] text-subtle font-medium">{artifact.title}</span>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {artifact.chips.map((c) => (
          <Chip
            key={c.id}
            tone={c.tone === 'accent' ? 'accent' : 'neutral'}
            interactive
            onClick={() => onRefine?.(c.label, c.prompt)}
          >
            {c.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
