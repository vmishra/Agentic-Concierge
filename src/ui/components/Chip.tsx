import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'trace' | 'success' | 'danger'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone
  interactive?: boolean
  icon?: ReactNode
}

const tones: Record<Tone, string> = {
  neutral:
    'bg-elev-1 text-muted border-[color:var(--border)]',
  accent:
    'bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent-soft)]',
  trace:
    'bg-[color:var(--trace-soft)] text-[color:var(--trace)] border-[color:var(--trace-soft)]',
  success:
    'bg-[oklch(72%_0.11_160/0.14)] text-[color:var(--success)] border-[oklch(72%_0.11_160/0.20)]',
  danger:
    'bg-[oklch(68%_0.15_25/0.14)] text-[color:var(--danger)] border-[oklch(68%_0.15_25/0.20)]',
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { tone = 'neutral', interactive = false, icon, className, children, ...rest },
  ref,
) {
  const Tag = (interactive ? 'button' : 'span') as 'button' | 'span'
  return (
    <Tag
      ref={ref as never}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 h-6 text-[11px] font-medium tracking-tight',
        'transition-[background-color,color,border-color] duration-150 ease-out',
        interactive && 'cursor-pointer hover:brightness-[1.1] active:brightness-[0.98]',
        tones[tone],
        className,
      )}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {icon ? <span className="flex items-center">{icon}</span> : null}
      {children}
    </Tag>
  )
})
