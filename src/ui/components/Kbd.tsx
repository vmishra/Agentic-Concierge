import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-[6px] border text-[10.5px] font-mono font-medium',
        'bg-elev-1 text-muted border-[color:var(--border)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
