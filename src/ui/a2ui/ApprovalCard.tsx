import { useEffect, useState } from 'react'
import { Check, X, UserCheck } from 'lucide-react'
import type { A2UIArtifact } from '@/adk/a2ui'
import { hitlBus } from '@/adk/hitl'
import { CardHeader, SurfaceCard } from './_common'
import { cn } from '@/lib/cn'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'approval_request' }> }

export function ApprovalCard({ artifact }: Props) {
  // local state so the card "locks" after a click even if the artifact
  // prop was persisted from a prior turn.
  const [state, setState] = useState<'pending' | 'approved' | 'denied'>(artifact.state ?? 'pending')

  useEffect(() => {
    if (artifact.state && artifact.state !== 'pending') setState(artifact.state)
  }, [artifact.state])

  function decide(approved: boolean) {
    if (state !== 'pending') return
    setState(approved ? 'approved' : 'denied')
    hitlBus.resolve(artifact.requestId, { kind: 'approval', approved })
  }

  return (
    <SurfaceCard
      className={cn(
        'relative overflow-hidden',
        state === 'pending' ? 'border-[color:var(--accent)]' : undefined,
      )}
    >
      {/* Accent hairline while pending — draws the eye */}
      {state === 'pending' ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--accent-hairline) 20%, var(--accent-hairline) 80%, transparent)',
          }}
        />
      ) : null}
      <CardHeader
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="size-3" strokeWidth={1.5} />
            human-in-the-loop · request_approval
          </span>
        }
        title={artifact.title}
        subtitle={artifact.body}
      />
      {artifact.meta && artifact.meta.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
          {artifact.meta.map((m, i) => (
            <div key={i} className="flex items-baseline justify-between hairline-b py-2">
              <dt className="text-[11px] uppercase tracking-wider text-subtle">{m.label}</dt>
              <dd className="text-[13px] text-text numeric">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-[11px] text-subtle flex items-center gap-1.5">
          <span
            className={cn(
              'size-1.5 rounded-full',
              state === 'pending'
                ? 'bg-[color:var(--accent)] animate-pulse'
                : state === 'approved'
                  ? 'bg-[color:var(--success)]'
                  : 'bg-[color:var(--danger)]',
            )}
          />
          {state === 'pending'
            ? 'The agent is paused — awaiting your decision.'
            : state === 'approved'
              ? 'Approved. The agent resumed and is completing the turn.'
              : 'Declined. The agent will offer a revision.'}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            disabled={state !== 'pending'}
            className={cn(
              'h-9 px-3 rounded-[var(--radius-sm)] text-[12.5px] font-medium inline-flex items-center gap-1.5',
              'bg-elev-2 border border-[color:var(--border)] text-muted hover:text-text',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            <X className="size-3.5" strokeWidth={1.7} />
            {artifact.denyLabel ?? 'Not yet'}
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            disabled={state !== 'pending'}
            className={cn(
              'h-9 px-4 rounded-[var(--radius-sm)] text-[12.5px] font-medium inline-flex items-center gap-1.5',
              'bg-[color:var(--accent)] text-[oklch(16%_0_0)] hover:brightness-[1.04]',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            <Check className="size-3.5" strokeWidth={2} />
            {artifact.approveLabel ?? 'Approve'}
          </button>
        </div>
      </div>
    </SurfaceCard>
  )
}
