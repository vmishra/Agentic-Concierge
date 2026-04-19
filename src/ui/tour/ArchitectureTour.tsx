import { useCallback, useEffect, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { X, ArrowLeft, ArrowRight, Workflow, Plus, Minus } from 'lucide-react'
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
  HierarchyDiagram,
  HitlDiagram,
} from './diagrams'

interface Slide {
  id: string
  kicker: string
  title: string
  /** Bullet points — the slide view, shown by default. */
  bullets: string[]
  /** One-line takeaway shown under the bullets, always visible. */
  takeaway: string
  /** Longer paragraph — revealed when the + toggle is expanded. */
  blurb: string
  diagram: ReactNode
  code?: string
  sourcePath?: string
}

const slides = (): Slide[] => [
  {
    id: 'overture',
    kicker: '01 · architecture',
    title: 'A coordinator. Five specialists. Three shared layers.',
    bullets: [
      'A single coordinator agent fans work out to five specialists in parallel',
      'Built on Google ADK with the Agent-to-Agent (A2A) dispatch pattern',
      'Shared layers: lazy tool catalog · embedding-indexed memory · context budgeter',
      'Specialists return typed artifacts; the coordinator assembles one coherent reply',
    ],
    takeaway:
      'The agent-as-tool pattern keeps the coordinator in control while parallelising the work. Every dispatch, skill load, and tool call is observable in real time.',
    blurb:
      'A single coordinator agent receives the user request and fans work out to five specialist agents in parallel — Researcher, Logistics, Experience, Budget, Personalizer — over Google\'s Agent Development Kit (ADK) and the Agent-to-Agent (A2A) dispatch pattern. Shared underneath: a lazy tool catalog, an embedding-indexed memory service, and a context budgeter. Each specialist returns a typed artifact; the coordinator assembles them into a single cohesive response.',
    diagram: <OvertureDiagram />,
    sourcePath: 'src/adk/ · src/agents/',
  },
  {
    id: 'hierarchy',
    kicker: '02 · agent hierarchy',
    title: 'A tree, not a flat panel of chatbots.',
    bullets: [
      'Any agent can expose sub-agents as tools — the pattern is recursive',
      'Concierge → five specialists → nested workflows (plan, search, critique, refine)',
      'The tree is arbitrarily deep; traces and artifacts bubble to the root',
      'The user still experiences a single voice',
    ],
    takeaway:
      'The agent-as-tool pattern is recursive. Hierarchies encode expertise without fragmenting the user experience.',
    blurb:
      'Every agent can expose sub-agents as tools. The Concierge delegates to five specialists; each specialist can itself delegate further — the Researcher runs a plan/search/critique/refine sub-loop, the Experience specialist can invoke a tier-ranking helper. The tree is arbitrarily deep, but traces and artifacts bubble up to the root, so the user still experiences a single voice.',
    diagram: <HierarchyDiagram />,
    code: `const researcher = new LlmAgent({
  name: 'Researcher',
  subAgents: [planningAgent, searchAgent, critiqueAgent],
  // ...
})`,
    sourcePath: 'src/agents/ · src/adk/agent.ts',
  },
  {
    id: 'skills',
    kicker: '03 · skills · on-demand context',
    title: 'Agents start lean. Skills attach only when needed.',
    bullets: [
      'Agents declare the skills they may use; the runtime loads one only when required',
      'A load merges instructions into the prompt and attaches the skill\'s tools',
      'Each load emits a visible `skill · load` event in the activity ribbon',
      'Skills are reusable units: instructions + tools + resources',
    ],
    takeaway:
      'A skill is a reusable unit. Five ship with this prototype; new skills can be added without modifying the agents themselves.',
    blurb:
      'An agent declares the skills it may use. The runtime loads one only when the coordinator determines it is needed — attaching that skill\'s tool bundle, merging its instructions into the prompt, and emitting a `skill · load` event. This keeps the system prompt small by default and makes context expansion an auditable, first-class step.',
    diagram: <SkillsDiagram />,
    code: `export const hospitalityTiersSkill: Skill = {
  name: 'hospitality-tiers',
  description: 'Paddock, debenture, pavilion — what each tier includes.',
  instructions: 'Explain tiers in concrete terms; be specific.',
  tools: [ defineLazyTool(/* manifest */, async () => /* impl */) ],
}`,
    sourcePath: 'src/adk/skill.ts',
  },
  {
    id: 'tools',
    kicker: '04 · tools · manifests first',
    title: 'Manifests register. Implementations load at call time.',
    bullets: [
      'Every tool is a lightweight manifest — name, description, JSON-Schema',
      'Implementations load via dynamic `import()` only when about to execute',
      'Parallel tool calls fan out with `Promise.all`',
      'Errors surface as structured events the coordinator can recover from',
    ],
    takeaway:
      'Tool loading is a visible, observable operation. The catalog is a map of pointers; implementations live behind dynamic imports.',
    blurb:
      'Every tool is registered as a lightweight manifest — name, description, JSON-Schema. The implementation is a dynamic `import()` that resolves only when the tool is about to execute. Parallel tool calls fan out with `Promise.all`; errors surface as structured events the coordinator can recover from. This matches Gemini 3 Flash\'s profile of 100+ reliable tool calls per turn while keeping the initial bundle small.',
    diagram: <ToolsDiagram />,
    code: `// the catalog stores only pointers
catalog.register(lazyTool)

// the implementation is resolved at call time
const tool   = await catalog.load(name)
const result = await tool.execute(args, ctx)`,
    sourcePath: 'src/adk/tool.ts',
  },
  {
    id: 'memory',
    kicker: '05 · memory · repeat-user personalisation',
    title: 'Preferences persist across sessions — and arrive in context.',
    bullets: [
      'Two layers: short-term session scratchpad + long-term embedding-indexed store',
      'Indexed by Google gemini-embedding-2 (multimodal: text, image, audio, video)',
      'Every user turn runs a top-k semantic search; hits inject into the next prompt',
      'API aligned with ADK Memory Service and Vertex AI Memory Bank',
    ],
    takeaway:
      'Write · embed · persist · recall. Same shape as ADK Memory Service for a direct production path.',
    blurb:
      'Memory operates at two layers. Short-term session state is a shared scratchpad across agents within a turn. Long-term memory is embedding-indexed by Google\'s multimodal gemini-embedding-2 and persisted client-side. On every user message, the Personalizer runs a top-k semantic search; matching facts are injected into the coordinator\'s next prompt. When the same user returns — same device or, with Firestore, any device — the previous preferences are already in context.',
    diagram: <MemoryDiagram />,
    code: `await memory.add('partner is vegan; mobility need for guest 2')
const hits = await memory.search('dietary and accessibility', 4, 0.22)
// matching facts are injected into the coordinator's next system prompt
injectedInstructions.push(\`Known preferences: \${hits.map(h => '· ' + h.fact.text).join('\\n')}\`)`,
    sourcePath: 'src/adk/memory.ts',
  },
  {
    id: 'a2ui',
    kicker: '06 · a2ui · generative UI',
    title: 'Agents emit typed components, rendered by the client.',
    bullets: [
      'Agent output is typed JSON against a pre-approved component catalog',
      'Client renders with its own design tokens — safer than HTML, portable across surfaces',
      'Interactive by default: refinement chips re-query the right specialist',
      'Nine component kinds ship; the catalog is extensible without touching the agents',
    ],
    takeaway:
      'A declarative contract separates agent output from presentation.',
    blurb:
      'Google\'s Agent-to-UI (A2UI) protocol replaces free-form text output with declarative JSON against a pre-approved component catalog — itineraries, option grids, comparison tables, pricing breakdowns, research scratchpads. The client renders using its own design tokens. The result is safer than free-form HTML, portable across surfaces, and interactive by default: every refinement chip beneath a card routes back to the relevant specialist as a structured re-query.',
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
    id: 'hitl',
    kicker: '07 · human-in-the-loop',
    title: 'Pause mid-turn for an explicit human decision.',
    bullets: [
      '`request_approval` is a tool — it blocks on a HitlBus promise',
      'The client renders an approval_request artifact with Approve / Not yet',
      'User\'s click resolves the promise; the tool returns a structured decision',
      'The runner\'s ordinary tool loop resumes — observable in the ribbon',
    ],
    takeaway:
      'Human-in-the-loop is another async tool call. Human oversight is a first-class capability, not a retrofit.',
    blurb:
      'When a step is consequential — a booking, an approval, an upgrade over budget — the agent invokes `request_approval`, a tool that blocks on a HitlBus promise. The client renders an approval_request A2UI artifact with Approve / Not yet controls; the user\'s click resolves the promise and the tool returns a structured decision. The runner\'s ordinary tool loop then resumes. Human oversight is a first-class capability in the architecture, not a retrofit.',
    diagram: <HitlDiagram />,
    code: `// src/skills/human-in-the-loop.ts
// request_approval tool awaits the user's click on the ApprovalCard
const decision = await hitlBus.await(requestId)
return { approved: decision.approved, note: decision.note }`,
    sourcePath: 'src/adk/hitl.ts · src/skills/human-in-the-loop.ts',
  },
  {
    id: 'runner',
    kicker: '08 · runner · one turn',
    title: 'The execution loop — a single file, end to end.',
    bullets: [
      'Assembles the prompt: system instructions + active skills + memory hits',
      'Streams from the model; executes tool calls in parallel',
      'Dispatches sub-agents over A2A with their own sessions',
      'Loops until done; sub-agent artifacts route back to the shared workspace',
    ],
    takeaway:
      'Provider-agnostic: the same loop runs against Gemini 3 Flash today and any future model.',
    blurb:
      'The runner assembles the prompt (system instructions + active skills + memory hits), streams from the model, executes tool calls in parallel, dispatches sub-agents over the A2A interface with their own sessions, and loops until the stream completes. Sub-agent artifacts are routed back into the shared workspace so the user sees a single, coherent response.',
    diagram: <RunnerDiagram />,
    sourcePath: 'src/adk/runner.ts',
  },
  {
    id: 'deep-research',
    kicker: '09 · deep research · LoopAgent',
    title: 'Iterative research, made observable.',
    bullets: [
      'Researcher is an ADK LoopAgent — Google\'s Interactions API primitive',
      'Each cycle: plan → search → critique → refine',
      'Emits research_step events + updates a live research_scratchpad artifact',
      'Sub-questions, findings, and citations are inspectable, not hidden',
    ],
    takeaway:
      'LoopAgent, ParallelAgent, and SequentialAgent compose any research or planning workflow.',
    blurb:
      'The Researcher is implemented as an ADK LoopAgent — the same deterministic workflow primitive Google introduced in the ADK Interactions API for long-running, iterative tasks. Each cycle runs plan → search → critique → refine. Every iteration emits a research_step event and updates a live research_scratchpad artifact with sub-questions, findings, and citations, so the user can inspect the reasoning rather than wait on a progress bar.',
    diagram: <RunnerDiagram />,
    code: `const researcher = new LlmAgent({
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
    kicker: '10 · long-context management',
    title: 'Disciplined use of a 1M-token window.',
    bullets: [
      'Gemini 3 Flash: 1M-token context window',
      'Live `ctx` meter tracks approximate usage continuously',
      'Compactor folds older turns into a `priorSummary` once a threshold is crossed',
      'Saved token count reported as a trace event',
    ],
    takeaway:
      'Long-context is a capability and a discipline. The compaction policy is configurable per deployment.',
    blurb:
      'Gemini 3 Flash exposes a 1M-token context window. The runtime tracks approximate usage continuously (the `ctx` meter in the top chrome) and, once the window crosses a configurable soft threshold, the Compactor summarises older turns into a compact `priorSummary` note and removes them from the live prompt. The saved token count is reported as a trace event. Deep Research iterations remain observable without inflating the prompt.',
    diagram: <ContextDiagram />,
    sourcePath: 'src/adk/context-budget.ts',
  },
]

/** Wrap `backticked` segments in <code> so bullets feel slide-ready. */
function codify(s: string): string {
  const escaped = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(
    /`([^`]+)`/g,
    (_, code) =>
      `<code style="font-family:var(--font-mono);font-size:0.92em;color:var(--trace);background:color-mix(in oklab,var(--trace) 12%,transparent);padding:1px 6px;border-radius:4px;">${code}</code>`,
  )
}

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
  const [expanded, setExpanded] = useState(false)
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

  // Reset the expand state whenever the slide changes — each slide starts
  // collapsed, the way a slide deck should.
  useEffect(() => {
    setExpanded(false)
  }, [idx])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[oklch(0%_0_0/0.6)] backdrop-blur-[3px] data-[state=open]:animate-[fadeIn_180ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 inset-2 md:inset-4 lg:inset-6 rounded-[var(--radius-2xl)] overflow-hidden outline-none',
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
                className="grid grid-cols-1 lg:grid-cols-[minmax(460px,1fr)_minmax(520px,1.25fr)]"
              >
                <article className="flex flex-col gap-6 p-10 md:p-14 lg:p-16 max-w-[680px]">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--accent)] font-medium">
                    {slide.kicker}
                  </span>
                  <h2 className="display text-[32px] md:text-[40px] lg:text-[44px] font-medium leading-[1.08] tracking-tight text-text">
                    {slide.title}
                  </h2>

                  <ul className="flex flex-col gap-3 mt-1">
                    {slide.bullets.map((b, i) => (
                      <motion.li
                        key={`${slide.id}-${i}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: { ...spring, delay: 0.15 + i * 0.09 },
                        }}
                        className="flex items-start gap-3 text-[15px] text-text leading-[1.6]"
                      >
                        <span
                          aria-hidden
                          className="mt-[10px] size-1.5 rounded-full shrink-0"
                          style={{ background: 'var(--accent)' }}
                        />
                        <span dangerouslySetInnerHTML={{ __html: codify(b) }} />
                      </motion.li>
                    ))}
                  </ul>

                  <div className="hairline-t pt-5 text-[13.5px] text-text leading-relaxed">
                    <span className="text-[10.5px] uppercase tracking-[0.18em] text-subtle font-medium block mb-2">
                      takeaway
                    </span>
                    {slide.takeaway}
                  </div>

                  {/* Expand toggle — reveals the paragraph, code, and source path */}
                  <div className="mt-auto pt-2">
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className={cn(
                        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px] font-medium transition-colors',
                        'bg-elev-1 border-[color:var(--border)] text-muted hover:text-text hover:border-[color:var(--border-strong)]',
                      )}
                      aria-expanded={expanded}
                    >
                      {expanded ? (
                        <>
                          <Minus className="size-3" strokeWidth={1.7} />
                          show less
                        </>
                      ) : (
                        <>
                          <Plus className="size-3" strokeWidth={1.7} />
                          more detail
                        </>
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded ? (
                        <motion.div
                          key="expanded"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                          className="overflow-hidden"
                        >
                          <div className="pt-5 flex flex-col gap-4">
                            <p className="text-[13.5px] text-muted leading-[1.75]">{slide.blurb}</p>
                            {slide.code ? (
                              <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--border)] bg-elev-1 p-4 text-[12px] leading-[1.65] font-mono text-muted">
                                <code>{slide.code}</code>
                              </pre>
                            ) : null}
                            {slide.sourcePath ? (
                              <div className="flex items-center gap-2 text-[11px] text-subtle font-mono">
                                <span className="inline-block size-1 rounded-full bg-[color:var(--trace)]" />
                                {slide.sourcePath}
                              </div>
                            ) : null}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </article>
                <aside className="relative flex items-center justify-center p-10 md:p-14 lg:p-16 min-h-[560px] lg:min-h-[640px] bg-[oklch(13%_0.012_260)] border-l border-[color:var(--border)]">
                  <div className="w-full max-w-[640px]">{slide.diagram}</div>
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
