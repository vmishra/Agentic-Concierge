import type { A2UIArtifact } from '@/adk/a2ui'
import { CardHeader, SurfaceCard } from './_common'

type Props = { artifact: Extract<A2UIArtifact, { kind: 'map_preview' }> }

/**
 * Minimal SVG map — no API key, no tiles. A subtle stylised plot of lat/lng
 * within the artifact's own extent, plus a list of places. Premium demos that
 * can't hit live map APIs should feel restrained, not fake.
 */
export function MapPreview({ artifact }: Props) {
  const places = artifact.places
  const lats = places.map((p) => p.lat)
  const lngs = places.map((p) => p.lng)
  const pad = 0.01
  const minLat = Math.min(...lats) - pad
  const maxLat = Math.max(...lats) + pad
  const minLng = Math.min(...lngs) - pad
  const maxLng = Math.max(...lngs) + pad
  const w = 360
  const h = 160
  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * w
    const y = h - ((lat - minLat) / Math.max(0.0001, maxLat - minLat)) * h
    return { x, y }
  }

  return (
    <SurfaceCard>
      <CardHeader eyebrow="geography" title={artifact.title} />
      <div className="mt-5 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[oklch(18%_0.012_260)]">
        <svg viewBox={`0 0 ${w} ${h}`} className="block w-full h-[160px]" aria-hidden>
          {/* subtle grid */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={(w / 8) * i}
              y1={0}
              x2={(w / 8) * i}
              y2={h}
              stroke="oklch(28% 0.012 260)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={(h / 5) * i}
              x2={w}
              y2={(h / 5) * i}
              stroke="oklch(28% 0.012 260)"
              strokeWidth={0.5}
            />
          ))}
          {/* connecting line */}
          {places.length > 1 ? (
            <polyline
              points={places.map((p) => {
                const { x, y } = project(p.lat, p.lng)
                return `${x},${y}`
              }).join(' ')}
              stroke="oklch(80% 0.13 85 / 0.4)"
              strokeWidth={1.25}
              strokeDasharray="3 3"
              fill="none"
            />
          ) : null}
          {places.map((p, i) => {
            const { x, y } = project(p.lat, p.lng)
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={4.5} fill="oklch(80% 0.13 85)" />
                <circle cx={x} cy={y} r={8} fill="oklch(80% 0.13 85 / 0.2)" />
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {places.map((p, i) => (
          <li key={i} className="flex items-baseline gap-3 text-[13px]">
            <span className="numeric text-subtle w-6">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-text">{p.name}</span>
            {p.subtitle ? <span className="text-subtle text-[12px]">· {p.subtitle}</span> : null}
          </li>
        ))}
      </ul>
    </SurfaceCard>
  )
}
