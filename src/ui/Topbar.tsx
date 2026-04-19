import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useApp } from '@/state/store'
import { cn } from '@/lib/cn'
import { SettingsSheet } from './SettingsSheet'

export function Topbar() {
  const [open, setOpen] = useState(false)
  const mode = useApp((s) => s.settings.mode)
  const providerLabel = useApp((s) => s.runtime.provider.label)
  const tokensUsed = useApp((s) => s.tokensUsed)
  const tokenBudget = useApp((s) => s.tokenBudget)
  const pct = Math.min(100, (tokensUsed / tokenBudget) * 100)

  return (
    <>
      <header className="hairline-b relative flex h-14 items-center justify-between px-5 bg-surface">
        <div className="flex items-center gap-3">
          <Wordmark />
          <span className="text-subtle text-xs hidden md:inline">· a prototype of bespoke, agent-driven travel</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ContextMeter pct={pct} used={tokensUsed} budget={tokenBudget} />
          <ModePill mode={mode} label={providerLabel} />
          <button
            type="button"
            className="text-muted hover:text-text hover:bg-elev-1 rounded-md p-2 transition-colors"
            aria-label="Settings"
            onClick={() => setOpen(true)}
          >
            <Settings2 className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--accent-hairline) 20%, var(--accent-hairline) 80%, transparent)',
          }}
        />
      </header>
      <SettingsSheet open={open} onOpenChange={setOpen} />
    </>
  )
}

function Wordmark() {
  return (
    <div className="flex items-baseline gap-2">
      <span className="display text-[20px] font-medium tracking-tight">Agent Concierge</span>
    </div>
  )
}

function ModePill({ mode, label }: { mode: 'mock' | 'live'; label: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11px] font-medium',
        mode === 'live'
          ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent-soft)] text-[color:var(--accent)]'
          : 'bg-elev-1 border-[color:var(--border)] text-muted',
      )}
      title={mode === 'live' ? 'Streaming real Gemini responses' : 'Scripted — no network calls'}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label}
    </div>
  )
}

function ContextMeter({ pct, used, budget }: { pct: number; used: number; budget: number }) {
  return (
    <div
      className="hidden md:inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-elev-1 border border-[color:var(--border)] text-muted"
      title={`Approximate tokens in the live window · ${used.toLocaleString()} of ${budget.toLocaleString()}`}
    >
      <span className="text-[10.5px] uppercase tracking-wider">ctx</span>
      <span className="w-16 h-1 rounded-full bg-elev-2 overflow-hidden">
        <span className="block h-full bg-[color:var(--trace)] transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </span>
      <span className="numeric text-[10.5px]">{formatK(used)}</span>
    </div>
  )
}

function formatK(n: number) {
  if (n < 1000) return `${n}`
  return `${(n / 1000).toFixed(1)}k`
}
