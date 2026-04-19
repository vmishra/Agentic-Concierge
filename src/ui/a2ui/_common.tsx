import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function CardHeader({
  eyebrow,
  title,
  subtitle,
  right,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium">{eyebrow}</span>
        ) : null}
        <h3 className="display text-[22px] font-medium tracking-tight leading-snug">{title}</h3>
        {subtitle ? <p className="text-muted text-[13.5px] leading-relaxed">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  )
}

export function SurfaceCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-lg)] bg-elev-1 border border-[color:var(--border)] shadow-[var(--shadow-2)]',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}
