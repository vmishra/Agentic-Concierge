import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  elev?: 0 | 1 | 2
  padded?: boolean
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { elev = 1, padded = true, className, ...rest },
  ref,
) {
  const bg = elev === 0 ? 'bg-surface-raised' : elev === 1 ? 'bg-elev-1' : 'bg-elev-2'
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-lg)] border border-[color:var(--border)] shadow-[var(--shadow-1)]',
        bg,
        padded && 'p-5',
        className,
      )}
      {...rest}
    />
  )
})
