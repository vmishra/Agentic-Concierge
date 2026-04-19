import type { A2UIArtifact, Money } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'
import { fmtMoney } from '@/lib/format'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'comparison_table' }> }

function fmt(v: string | number | Money | null): string {
  if (v === null) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number') return v.toLocaleString()
  return fmtMoney(v)
}

export function ComparisonTable({ artifact }: Props) {
  return (
    <SurfaceCard>
      <CardHeader eyebrow="comparison" title={artifact.title} />
      <div className="mt-5 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--border)]">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-elev-2">
              <th className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-subtle font-medium">
                attribute
              </th>
              {artifact.columns.map((c) => (
                <th
                  key={c}
                  className="px-4 py-2.5 text-left text-[12px] font-medium text-text border-l border-[color:var(--border)]"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {artifact.rows.map((row, i) => (
              <tr key={i} className={i > 0 ? 'border-t border-[color:var(--border)]' : ''}>
                <th className="px-4 py-3 text-left text-[12px] text-muted font-medium whitespace-nowrap">
                  {row.attribute}
                </th>
                {row.values.map((v, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 align-top numeric border-l border-[color:var(--border)]"
                  >
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  )
}
