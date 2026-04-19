import type { A2UIArtifact } from '@/adk/a2ui'
import { cn } from '@/lib/cn'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'note' }> }

export function Note({ artifact }: Props) {
  const tone = artifact.tone ?? 'neutral'
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border px-4 py-3 text-[13px] leading-relaxed',
        tone === 'accent' && 'bg-[color:var(--accent-soft)] border-[color:var(--accent-soft)] text-[color:var(--accent)]',
        tone === 'success' && 'bg-[oklch(72%_0.11_160/0.14)] border-[oklch(72%_0.11_160/0.20)] text-[color:var(--success)]',
        tone === 'warning' && 'bg-[oklch(80%_0.14_65/0.14)] border-[oklch(80%_0.14_65/0.20)] text-[color:var(--accent)]',
        tone === 'neutral' && 'bg-elev-1 border-[color:var(--border)] text-muted',
      )}
    >
      {artifact.title ? <div className="font-medium text-text mb-1">{artifact.title}</div> : null}
      <div className="whitespace-pre-line">{artifact.body}</div>
    </div>
  )
}
