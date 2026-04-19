import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2, Moon, Sun } from 'lucide-react'
import { useApp } from '@/state/store'
import { cn } from '@/lib/cn'
import { Button } from './components/Button'
import { Chip } from './components/Chip'

export function SettingsSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const settings = useApp((s) => s.settings)
  const setMode = useApp((s) => s.setMode)
  const setTheme = useApp((s) => s.setTheme)
  const setApiKey = useApp((s) => s.setApiKey)
  const clearMemory = useApp((s) => s.clearMemory)
  const resetConversation = useApp((s) => s.resetConversation)
  const runtime = useApp((s) => s.runtime)
  const tokensUsed = useApp((s) => s.tokensUsed)
  const tokenBudget = useApp((s) => s.tokenBudget)

  const [keyInput, setKeyInput] = useState(settings.apiKey ?? '')
  const [memoryFacts, setMemoryFacts] = useState<ReturnType<typeof runtime.memory.all>>([])

  useEffect(() => {
    setMemoryFacts(runtime.memory.all())
  }, [open, runtime])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[oklch(0%_0_0/0.45)] backdrop-blur-[2px] data-[state=open]:animate-[fadeIn_150ms_ease-out] z-40" />
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 h-full w-[440px] z-50',
            'bg-elev-1 border-l border-[color:var(--border)] shadow-[var(--shadow-lift)]',
            'flex flex-col outline-none',
            'data-[state=open]:animate-[slideInRight_220ms_cubic-bezier(0.16,1,0.3,1)]',
          )}
        >
          <header className="hairline-b flex items-center justify-between px-5 h-14">
            <Dialog.Title asChild>
              <span className="display text-[17px] font-medium">Settings</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center" aria-label="Close">
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto">
            <Section title="Mode" description="Mock runs the scripted demo with no network. Live streams real Gemini 3 Flash responses using the key below.">
              <div className="flex gap-2">
                <ModeOption active={settings.mode === 'mock'} onClick={() => setMode('mock')} label="Mock · scripted" hint="no network, deterministic" />
                <ModeOption active={settings.mode === 'live'} onClick={() => setMode('live')} label="Live · Gemini 3 Flash" hint="uses VITE_GEMINI_API_KEY" />
              </div>
            </Section>
            <Section title="Gemini API key" description="Used only in Live mode. Exposing a key in the browser is a prototype-only pattern.">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? 'Using VITE_GEMINI_API_KEY from .env.local' : 'AIza…'}
                  className="flex-1 h-9 px-3 rounded-[var(--radius-sm)] bg-surface border border-[color:var(--border)] text-[13px] outline-none focus:border-[color:var(--border-strong)]"
                />
                <Button size="sm" variant="soft" onClick={() => setApiKey(keyInput)}>
                  Save
                </Button>
              </div>
              <p className="mt-2 text-[11.5px] text-subtle leading-relaxed">
                When set, switching to Live will route through Gemini. Keys are kept in your browser only.
              </p>
            </Section>
            <Section title="Theme">
              <div className="flex gap-2">
                <ThemeOption active={settings.theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon className="size-3.5" strokeWidth={1.5} />} label="Dark" />
                <ThemeOption active={settings.theme === 'light'} onClick={() => setTheme('light')} icon={<Sun className="size-3.5" strokeWidth={1.5} />} label="Light" />
              </div>
            </Section>
            <Section title="Context budget" description="Approximate tokens kept in the live window. A discipline, not a limit.">
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between text-[12px]">
                  <span className="text-muted">in-use</span>
                  <span className="numeric text-text">
                    {tokensUsed.toLocaleString()} / {tokenBudget.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-elev-2 overflow-hidden">
                  <div
                    className="h-full bg-[color:var(--trace)]"
                    style={{ width: `${Math.min(100, (tokensUsed / tokenBudget) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-subtle">
                  {runtime.provider.label} · {runtime.provider.model?.() ?? 'mock'}
                </span>
              </div>
            </Section>
            <Section
              title="Long-term memory"
              description={`${memoryFacts.length} fact${memoryFacts.length === 1 ? '' : 's'} kept. Used to personalise future arrangements.`}
              right={
                <button
                  onClick={() => {
                    clearMemory()
                    setMemoryFacts([])
                  }}
                  className="text-[11.5px] text-[color:var(--danger)] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="size-3" strokeWidth={1.5} />
                  Clear
                </button>
              }
            >
              {memoryFacts.length === 0 ? (
                <p className="text-[12px] text-subtle">Nothing remembered yet.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {memoryFacts.map((f) => (
                    <li key={f.id} className="text-[12px] text-muted leading-relaxed pl-2 border-l border-[color:var(--border)]">
                      {f.text}
                      {f.source ? <Chip tone="neutral" className="ml-2 align-middle">{f.source}</Chip> : null}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section title="Conversation" description="Reset clears the transcript, the workspace, and the ribbon — but keeps memory.">
              <Button variant="outline" size="sm" onClick={resetConversation}>
                Reset conversation
              </Button>
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(8px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </Dialog.Root>
  )
}

function Section({
  title,
  description,
  children,
  right,
}: {
  title: string
  description?: string
  children: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <section className="hairline-b px-5 py-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[13px] font-medium tracking-tight">{title}</h3>
          {description ? <p className="text-[11.5px] text-subtle leading-relaxed">{description}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  )
}

function ModeOption({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors',
        active
          ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent)] text-[color:var(--accent)]'
          : 'bg-elev-1 border-[color:var(--border)] text-muted hover:text-text hover:bg-elev-2',
      )}
    >
      <div className="text-[13px] font-medium">{label}</div>
      <div className={cn('text-[11px] mt-0.5', active ? 'opacity-80' : 'text-subtle')}>{hint}</div>
    </button>
  )
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 px-3 rounded-[var(--radius-sm)] border inline-flex items-center gap-2 text-[12.5px]',
        active
          ? 'bg-[color:var(--accent-soft)] border-[color:var(--accent)] text-[color:var(--accent)]'
          : 'bg-elev-1 border-[color:var(--border)] text-muted hover:text-text',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
