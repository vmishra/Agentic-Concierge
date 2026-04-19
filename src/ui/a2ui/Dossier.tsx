import type { A2UIArtifact } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'
import { DossierShareAffordance } from './DossierShare'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'dossier' }> }

export function Dossier({ artifact }: Props) {
  return (
    <SurfaceCard className="bg-[linear-gradient(180deg,oklch(19%_0.012_260),oklch(17%_0.010_260))]">
      <CardHeader eyebrow="dossier" title={artifact.title} subtitle={artifact.summary} />
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
      <div className="mt-5 flex flex-col gap-4">
        {artifact.sections.map((s, i) => (
          <section key={i} className="flex flex-col gap-1.5">
            <h4 className="display text-[16px] font-medium tracking-tight">{s.title}</h4>
            <p className="text-[13.5px] text-muted leading-relaxed whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
      <DossierShareAffordance artifact={artifact} />
    </SurfaceCard>
  )
}
