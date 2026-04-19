import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'soft' | 'outline'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[oklch(16%_0_0)] hover:brightness-[1.04] active:brightness-[0.98] shadow-[var(--shadow-1)]',
  ghost:
    'bg-transparent text-text hover:bg-elev-1 active:bg-elev-2',
  soft:
    'bg-elev-1 text-text hover:bg-elev-2 active:bg-[color:var(--border)]',
  outline:
    'bg-transparent text-text border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:bg-elev-1',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'soft', size = 'md', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-[background-color,color,box-shadow,filter] duration-150 ease-out select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    />
  )
})
