import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useApp } from '@/state/store'
import { cn } from '@/lib/cn'
import { SettingsSheet } from './SettingsSheet'
import { ArchitectureTourButton } from './tour/ArchitectureTour'
import { BehindTheScenesButton } from './tour/BehindTheScenes'
import { HyperCareButton } from './tour/HyperCare'

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
          <ArchitectureTourButton />
          <BehindTheScenesButton />
          <HyperCareButton />
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
  const streaming = useApp((s) => s.isStreaming)
  return (
    <div className="flex items-center gap-2.5">
      <LiveDot streaming={streaming} />
      <span className="display text-[20px] font-medium tracking-tight leading-none pb-[2px]">
        Agent Concierge
      </span>
      <span
        className={cn(
          'hidden md:inline text-[10px] uppercase tracking-[0.22em] font-mono font-medium transition-colors',
          streaming ? 'text-[color:var(--accent)]' : 'text-[color:var(--success)]',
        )}
      >
        {streaming ? 'responding' : 'online'}
      </span>
    </div>
  )
}

function LiveDot({ streaming }: { streaming: boolean }) {
  const color = streaming ? 'var(--accent)' : 'var(--success)'
  return (
    <span className="relative flex size-2 shrink-0" aria-hidden>
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
      />
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          background: color,
          opacity: 0.55,
          animationDuration: streaming ? '1.1s' : '2.4s',
        }}
      />
    </span>
  )
}

function ModePill({ mode: _mode, label: _label }: { mode: 'mock' | 'live'; label: string }) {
  // Neutral, audience-facing label. The technical mode lives in Settings.
  return (
    <div
      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)] text-[color:var(--accent)] text-[11px] font-medium"
      title="Gemini 3 Flash · 1M context"
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      gemini-3-flash
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
