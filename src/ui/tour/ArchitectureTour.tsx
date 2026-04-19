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
    kicker: '01 · the architecture',
    title: 'One voice. Five minds. Three layers underneath.',
    blurb:
      'What you see in the chat is a Concierge. What you do not see: five specialist agents coordinating in parallel over Google\'s Agent Development Kit (ADK), a lazy tool catalog, an embedding-indexed memory service, and a long-context budgeter — all threading a single itinerary for you.',
    takeaway:
      'Coordinator + sub-agents via the agent-as-tool pattern — the shape of the emerging Agent-to-Agent (A2A) protocol. Every delegation is visible in the ribbon.',
    diagram: <OvertureDiagram />,
    sourcePath: 'src/adk/ · src/agents/',
  },
  {
    id: 'skills',
    kicker: '02 · skills · on-demand context',
    title: 'Agents start lean. Skills attach on demand.',
    blurb:
      'An agent advertises the skill names it *may* need. The runner loads one only when the coordinator decides it is required — attaching that skill\'s tool bundle, merging its instructions into the prompt, and emitting a visible `skill · load` chip in the ribbon. This is how progressive disclosure works at the prompting layer, rather than stuffing everything into a system prompt up front.',
    takeaway: 'A skill is reusable: instructions + tools + resources. Five ship with the concierge; you can add more without touching the agents.',
    diagram: <SkillsDiagram />,
    code: `export const hospitalityTiersSkill: Skill = {
  name: 'hospitality-tiers',
  description: 'Paddock, debenture, pavilion — what each tier includes.',
  instructions: 'Explain tiers in human terms; never promise, always arrange.',
  tools: [ defineLazyTool(/* manifest */, async () => /* impl */) ],
}`,
    sourcePath: 'src/adk/skill.ts',
  },
  {
    id: 'tools',
    kicker: '03 · tools · manifests first',
    title: 'Manifests now, implementations later.',
    blurb:
      'Every tool is registered as a small manifest — a name, a description, a JSON-Schema. The real implementation is a dynamic `import()` that runs only when the tool is about to execute. Parallel tool calls fan out with `Promise.all`; errors surface as structured events; the coordinator can auto-retry. Gemini 3 Flash is benchmarked to handle 100+ tool calls reliably; the harness matches that shape.',
    takeaway: 'The toolbelt expands as you watch — `tool · load` events appear in the ribbon exactly when needed.',
    diagram: <ToolsDiagram />,
    code: `// cheap: catalog stores only pointers
catalog.register(lazyTool)

// dynamic import happens at call time
const tool   = await catalog.load(name)
const result = await tool.execute(args, ctx)`,
    sourcePath: 'src/adk/tool.ts',
  },
  {
    id: 'memory',
    kicker: '04 · memory · repeat-user personalisation',
    title: 'First-time, second-time, tenth-time — the concierge just knows.',
    blurb:
      'Memory is two layers. Session state (a scratchpad the agents share within a turn) and long-term memory — embedding-indexed by Google\'s multimodal gemini-embedding-2 model. Every "remember X" writes a fact; every new user message triggers a semantic top-k recall that threads matching facts into the coordinator\'s prompt before it speaks. Walk away, close the browser, return next quarter — the vegan note, the mobility need, the preferred carrier are already in place. No forms. No re-briefing.',
    takeaway:
      'Write · embed · persist · recall. Same shape as ADK Memory Service and Vertex AI Memory Bank — swap localStorage for Firestore and you get cross-device, cross-session personalisation for free.',
    diagram: <MemoryDiagram />,
    code: `// repeat-user loop
await memory.add('partner is vegan; mobility need for guest 2')
const hits = await memory.search('dietary and accessibility', 4, 0.22)
//   ↓  threaded into the coordinator's next system prompt
injectedInstructions.push(\`Known preferences: \${hits.map(h => '· ' + h.fact.text).join('\\n')}\`)`,
    sourcePath: 'src/adk/memory.ts',
  },
  {
    id: 'a2ui',
    kicker: '05 · a2ui · generative UI',
    title: 'The agent speaks in components, not markdown.',
    blurb:
      'Google\'s emerging Agent-to-UI (A2UI) protocol turns agent output into typed JSON against a pre-approved component catalog — itineraries, option grids, comparisons, pricing breakdowns, research scratchpads. The frontend renders it with its own design tokens. Safer than free-form HTML, more portable than screenshots, interactive by default. Every refinement chip under a card is a one-tap re-query routed back to the right specialist.',
    takeaway: 'Nine component kinds ship. The contract is declarative — swap the renderer, all past artifacts re-theme.',
    diagram: <A2UIDiagram />,
    code: `{ kind: 'option_card_grid',
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
    kicker: '06 · runner · one turn',
    title: 'A single turn, ~300 lines.',
    blurb:
      'The runner assembles the prompt (system + active skills + memory hits), streams from the model, executes tool calls in parallel, dispatches sub-agents over the agent-as-tool / A2A interface with their own sessions, and loops until the stream signals done. Sub-agent artifacts bubble into the same workspace; the guest sees one cohesive story.',
    takeaway: 'One file, end-to-end. Provider-agnostic: the same loop runs behind Gemini 3 Flash and any future model.',
    diagram: <RunnerDiagram />,
    sourcePath: 'src/adk/runner.ts',
  },
  {
    id: 'deep-research',
    kicker: '07 · deep research · LoopAgent',
    title: 'A research agent you can watch think.',
    blurb:
      'The Researcher is an ADK LoopAgent — the same deterministic workflow primitive Google uses in the Interactions API for long-running, iterative research. Four steps per cycle: plan → search → critique → refine. Every iteration emits a research_step trace and updates a live scratchpad artifact with sub-questions, findings, and citations. The guest sees the work, not a silent spinner.',
    takeaway: 'LoopAgent + ParallelAgent + SequentialAgent compose into any research or planning flow. Same primitives as the public ADK, transparent by default.',
    diagram: <RunnerDiagram />,
    code: `// src/agents/index.ts
const researcher = new LlmAgent({
  name: 'Researcher',
  skills: ['event-catalog'],
  thinking: 'medium',
  systemPrompt: \`Iterate plan → search → critique → refine.
    Emit a research_scratchpad artifact; return a short brief.\`,
})`,
    sourcePath: 'src/adk/workflow.ts',
  },
  {
    id: 'context',
    kicker: '08 · context discipline',
    title: 'Even a million tokens deserve manners.',
    blurb:
      'Gemini 3 Flash carries a 1M-token context window. That is not a licence to stuff it. A live budget meter (top chrome) tracks usage; when the window crosses a soft threshold, the Compactor folds older turns into a `priorSummary` note and drops them from the live window. The ribbon shows the tokens saved. Deep Research iterations — plan → search → critique → refine — stay visible without bloating the prompt.',
    takeaway: 'Watch the `ctx` meter while you iterate. The live window stays lean even as the conversation grows.',
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
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 inset-4 md:inset-10 rounded-[var(--radius-2xl)] overflow-hidden outline-none',
            'bg-surface border border-[color:var(--border)] shadow-[var(--shadow-lift)]',
            'flex flex-col',
          )}
        >
          <header className="shrink-0 hairline-b flex items-center justify-between h-14 px-5 bg-elev-1">
            <div className="flex items-center gap-3">
              <Dialog.Title className="display text-[17px] font-medium">Under the hood</Dialog.Title>
              <span className="text-[11px] text-subtle hidden md:inline">a tour of the multi-agent machine behind the concierge</span>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close tour"
                className="size-8 rounded-md text-muted hover:text-text hover:bg-elev-2 flex items-center justify-center"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: spring }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]"
              >
                <article className="flex flex-col gap-5 p-8 md:p-12 max-w-[640px]">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--accent)] font-medium">
                    {slide.kicker}
                  </span>
                  <h2 className="display text-[30px] md:text-[38px] font-medium leading-[1.1] tracking-tight text-text">
                    {slide.title}
                  </h2>
                  <p className="text-[14.5px] text-muted leading-[1.7]">{slide.blurb}</p>
                  <div className="hairline-t pt-4 text-[13px] text-text leading-relaxed">
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
                <aside className="relative flex items-center justify-center p-8 md:p-12 min-h-[480px] bg-[oklch(13%_0.012_260)] border-l border-[color:var(--border)]">
                  <div className="w-full max-w-[520px]">{slide.diagram}</div>
                </aside>
              </motion.div>
            </AnimatePresence>
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
