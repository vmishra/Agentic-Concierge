import { Settings2 } from 'lucide-react'

export function Topbar() {
  return (
    <header className="hairline-b relative flex h-14 items-center justify-between px-5 bg-surface">
      <div className="flex items-center gap-3">
        <Wordmark />
        <span className="text-subtle text-xs">· a prototype of bespoke, agent-driven travel</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-muted hover:text-text hover:bg-elev-1 rounded-md p-2 transition-colors"
          aria-label="Settings"
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
  )
}

function Wordmark() {
  return (
    <div className="flex items-baseline gap-2">
      <span className="display text-[20px] font-medium tracking-tight">Agent Concierge</span>
    </div>
  )
}
