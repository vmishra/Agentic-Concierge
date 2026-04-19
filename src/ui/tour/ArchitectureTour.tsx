import { useCallback, useEffect, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { X, ArrowLeft, ArrowRight, Workflow } from 'lucide-react'
import { cn } from '@/lib/cn'
import { spring } from '../motion/presets'
import {
  OvertureDiagram,
  SkillsDiagram,
  ToolsDiagram,
  MemoryDiagram,
  A2UIDiagram,
  RunnerDiagram,
  ContextDiagram,
} from './diagrams'

interface Slide {
  id: string
  kicker: string
  title: string
  blurb: string
  takeaway: string
  diagram: ReactNode
  code?: string
  sourcePath?: string
}

const slides = (): Slide[] => [
  {
    id: 'overture',
    kicker: '01 · overture',
    title: 'One voice. Five minds. Three layers underneath.',
    blurb:
      'What you see on the left is a Concierge. What you do not see: five specialists, a lazy tool catalog, an embedding-indexed memory service, and a long-context budgeter — all running in your browser tab with zero backend.',
    takeaway: 'The whole system is ~2,200 lines. The ADK emulation layer is ~900. No server calls in Mock mode.',
    diagram: <OvertureDiagram />,
    sourcePath: 'src/adk/',
  },
  {
    id: 'skills',
    kicker: '02 · skills',
    title: 'Agents start lean. Skills attach on demand.',
    blurb:
      'An agent advertises skill names it may use. Only when the coordinator decides one is needed does the runner load it — attaching its tools to the toolbelt, merging its instructions into the prompt, and emitting a visible `skill · load` chip in the ribbon. This is how progressive disclosure works at the prompting layer.',
    takeaway: 'A skill is reusable: instructions + tools + resources. Five skills ship with the prototype.',
    diagram: <SkillsDiagram />,
    code: `// src/skills/hospitality-tiers.ts
export const hospitalityTiersSkill: Skill = {
  name: 'hospitality-tiers',
  description: 'Know what each tier includes — paddock, debenture, pavilion.',
  instructions: \`Explain tiers in human terms; never promise, always arrange.\`,
  tools: [
    defineLazyTool(
      { name: 'tiers_for_event', input: { /* JSON-Schema */ } },
      async () => defineTool(/* impl loaded only when called */),
    ),
  ],
}`,
    sourcePath: 'src/adk/skill.ts',
  },
  {
    id: 'tools',
    kicker: '03 · tools',
    title: 'Manifests now, implementations later.',
    blurb:
      'Every tool is registered as a tiny manifest — name, description, JSON-Schema. The real implementation is a dynamic `import()` that only runs when the tool is about to be called. Parallel tool calls fan out with `Promise.all`. Errors are structured events, not exceptions.',
    takeaway: 'The toolbelt expands as you watch — `tool · load` chips appear exactly when needed.',
    diagram: <ToolsDiagram />,
    code: `// the catalog stores only manifests
catalog.register(lazyTool)           // cheap: a pointer

// load happens at call time
const tool = await catalog.load(name)  // triggers import()
const result = await tool.execute(args, ctx)`,
    sourcePath: 'src/adk/tool.ts',
  },
  {
    id: 'memory',
    kicker: '04 · memory',
    title: 'What the concierge quietly remembers.',
    blurb:
      'Memory is two layers. Session state (short-term, a Map the agents share within a turn) and a long-term store backed by localStorage with embedding-indexed recall. On every user message, the Personalizer runs a semantic search; the top-k hits thread themselves into the coordinator\'s next prompt.',
    takeaway: 'Say "remember my partner is vegan" — reload the page — the fact survives. Hash embedder in Mock; Gemini embeddings in Live.',
    diagram: <MemoryDiagram />,
    code: `// src/adk/memory.ts
await memory.add('Guest prefers business-class arrivals before midnight')
const hits = await memory.search('flights and timing', 4, 0.22)
// → returns top-k facts ranked by cosine similarity`,
    sourcePath: 'src/adk/memory.ts',
  },
  {
    id: 'a2ui',
    kicker: '05 · a2ui',
    title: 'The agent speaks in components, not markdown.',
    blurb:
      'Instead of writing HTML or (worse) free-form prose the user has to parse, the agent emits typed JSON for a pre-approved component catalog — itineraries, option grids, comparisons, pricing breakdowns, research scratchpads. The frontend renders from its own design tokens. Safer than arbitrary markup, portable, interactive by default.',
    takeaway: 'Nine component kinds ship. Each refinement chip below a card is a one-tap re-query — no typing.',
    diagram: <A2UIDiagram />,
    code: `// The agent yields this…
{ kind: 'option_card_grid',
  title: 'Three hotels, threaded with accessibility',
  columns: 3,
  options: [
    { title: 'Waldorf Astoria — Yas Marina',
      price: { amount: 95000, currency: 'INR' },
      badges: [{ label: 'step-free', tone: 'success' }] },
    …
  ],
  refinements: [
    { label: 'Closer to the grounds' },
    { label: 'Compare these three' },
  ],
}`,
    sourcePath: 'src/adk/a2ui.ts',
  },
  {
    id: 'runner',
    kicker: '06 · runner',
    title: 'A single turn, ~300 lines.',
    blurb:
      'The runner assembles the prompt (system + active skills + memory hits), streams from the provider, executes tool calls in parallel, dispatches sub-agents with their own sessions, and loops until the provider says done. Sub-agent artifacts bubble into the same workspace — the guest sees one cohesive story.',
    takeaway: 'run() is the one file worth reading end-to-end. Provider-agnostic: Mock and Gemini plug into the same interface.',
    diagram: <RunnerDiagram />,
    sourcePath: 'src/adk/runner.ts',
  },
  {
    id: 'context',
    kicker: '07 · context discipline',
    title: 'Even 1M tokens need manners.',
    blurb:
      'Gemini 3 Flash has a million-token context window. That is not a licence to stuff it. A context budget meter (top chrome) tracks approximate usage; when the window crosses a soft threshold, the Compactor folds older turns into a short `priorSummary` note and drops them from the live window. The ribbon shows the token count saved.',
    takeaway: 'Watch the `ctx` meter as you iterate — the live window stays lean even as the conversation grows.',
    diagram: <ContextDiagram />,
    sourcePath: 'src/adk/context-budget.ts',
  },
]

export function ArchitectureTourButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[color:var(--border)] bg-elev-1 text-muted hover:text-text hover:border-[color:var(--border-strong)] transition-colors text-[11px] font-medium"
        title="Under the hood — the architecture tour"
      >
        <Workflow className="size-3.5" strokeWidth={1.5} />
        <span className="hidden sm:inline">under the hood</span>
      </button>
      <ArchitectureTour open={open} onOpenChange={setOpen} />
    </>
  )
}

function ArchitectureTour({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [idx, setIdx] = useState(0)
  const list = slides()
  const slide = list[idx]!
  const next = useCallback(() => setIdx((i) => Math.min(list.length - 1, i + 1)), [list.length])
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, next, prev])

  useEffect(() => {
    if (!open) setIdx(0)
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[oklch(0%_0_0/0.6)] backdrop-blur-[3px] data-[state=open]:animate-[fadeIn_180ms_ease-out]" />
        <Dialog.Content
          className={cn(
            'fixed z-50 inset-4 md:inset-10 rounded-[var(--radius-2xl)] overflow-hidden outline-none',
            'bg-surface border border-[color:var(--border)] shadow-[var(--shadow-lift)] grain',
            'flex flex-col',
            'data-[state=open]:animate-[tourIn_260ms_cubic-bezier(0.16,1,0.3,1)]',
          )}
        >
          <header className="shrink-0 hairline-b flex items-center justify-between h-14 px-5">
            <div className="flex items-center gap-3">
              <Dialog.Title asChild>
                <span className="display text-[17px] font-medium">Under the hood</span>
              </Dialog.Title>
              <span className="text-[11px] text-subtle">a tour of the multi-agent machine behind the concierge</span>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close tour"
                className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-1 flex items-center justify-center"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex min-h-0 flex-1">
            <div className="flex-1 min-w-0 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: spring }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-0"
                >
                  <article className="flex flex-col gap-5 p-8 md:p-12 max-w-[580px]">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--accent)] font-medium">
                      {slide.kicker}
                    </span>
                    <h2 className="display text-[34px] md:text-[40px] font-medium leading-[1.08] tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-[14.5px] text-muted leading-[1.7]">{slide.blurb}</p>
                    <div className="hairline-t pt-4 text-[12.5px] text-text leading-relaxed">
                      <span className="text-[10.5px] uppercase tracking-[0.18em] text-subtle font-medium block mb-1.5">
                        takeaway
                      </span>
                      {slide.takeaway}
                    </div>
                    {slide.code ? (
                      <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1 p-4 text-[12px] leading-relaxed font-mono text-muted">
                        <code>{slide.code}</code>
                      </pre>
                    ) : null}
                    {slide.sourcePath ? (
                      <div className="flex items-center gap-2 text-[11px] text-subtle font-mono">
                        <span className="inline-block size-1 rounded-full bg-[color:var(--trace)]" />
                        {slide.sourcePath}
                      </div>
                    ) : null}
                  </article>
                  <aside className="relative flex items-center justify-center p-8 md:p-12 min-h-[420px] bg-[oklch(13%_0.012_260)] border-l border-[color:var(--border)]">
                    <div className="w-full max-w-[520px]">{slide.diagram}</div>
                  </aside>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <footer className="shrink-0 hairline-t flex items-center justify-between h-16 px-5 bg-elev-1">
            <div className="flex items-center gap-1.5">
              {list.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to ${s.title}`}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === idx
                      ? 'w-10 bg-[color:var(--accent)]'
                      : 'w-1.5 bg-[color:var(--border-strong)] hover:bg-muted',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-subtle numeric font-mono">
                {String(idx + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
              </span>
              <div className="w-px h-5 bg-[color:var(--border)] mx-2" />
              <button
                onClick={prev}
                disabled={idx === 0}
                className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center disabled:opacity-30"
                aria-label="Previous"
              >
                <ArrowLeft className="size-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                disabled={idx === list.length - 1}
                className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center disabled:opacity-30"
                aria-label="Next"
              >
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
      <style>{`
        @keyframes tourIn { from { opacity: 0; transform: scale(0.98) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </Dialog.Root>
  )
}
