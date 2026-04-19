<div align="center">

# Agent Concierge

**A working prototype of what bespoke, agent-driven travel planning *feels like* in 2026.**
Multi-agent. Multi-skill. Memory-aware. Long-context-disciplined.
Runs entirely in the browser, zero backend.

<br/>

<code>./app.sh start</code> &nbsp;·&nbsp; <a href="#run-it">90-second setup</a> &nbsp;·&nbsp; <a href="#architecture-at-a-glance">architecture</a> &nbsp;·&nbsp; <a href="#concept-glossary">concepts</a> &nbsp;·&nbsp; <a href="#why-this-is-different-from-a-chatbot">why this matters</a>

<br/>

</div>

---

## The one-sentence version

> Most agent demos are a chat box with a spinner. This one shows a coordinator delegating in parallel to five specialists, loading skills on demand, remembering preferences across sessions, iterating a deep-research loop you can watch, and emitting a live workspace of itineraries, hotels, hospitality tiers, and pricing — in an interface that looks like it belongs in a Mayfair concierge's pocket, not a Next.js template.

It is a **reference prototype**. Not a product. Not an SDK. A code sample you can fork, learn from, strip to the bones, and graft into a real system.

---

## 60 seconds

**Prerequisite:** Node 20+ (the only one).

```sh
git clone https://github.com/vmishra/Agentic-Concierge
cd Agentic-Concierge
./app.sh start
```

That is the whole story. The script checks for Node, runs `npm install` on first run (and on `git pull`s that changed dependencies), starts Vite, waits until the server is ready, and prints the URL. Use `./app.sh stop` to shut it down, `./app.sh logs` to tail, `./app.sh restart` for the obvious.

No Node on the machine yet?

- **macOS**: `brew install node`
- **Linux**: use `nvm` — `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install 20`
- **Windows**: download the LTS from https://nodejs.org

Default mode is **Mock** — deterministic, no network, no keys. Pick any of the three seeded prompts on the empty state and the scenario plays out in front of you.

---

## What you will see

Pick *"Four of us, F1 Abu Dhabi in November. One uses a wheelchair. Budget ~₹50L."* and watch:

**The Activity Ribbon lights up first**, showing work as it happens — not what happened later, but what is happening right now:

```
● CONCIERGE · dispatching        skill · event-catalog     skill · dietary-accessibility
  Concierge → Researcher         Concierge → Logistics     Concierge → Experience
  Concierge → Budget             research · plan           tool · search_events
  research · search              research · critique       research · refine
  Researcher ✓                   tool · hotels_near_event  Logistics ✓
  tool · tiers_for_event         Experience ✓              Budget ✓
  emit · itinerary               emit · option_card_grid   emit · pricing_breakdown
```

**The Concierge writes a real sentence**, not a stock reply:

> *A late-November weekend at Yas Marina — the twilight race, the marina lit up, the season's last grid. Accessibility will thread through every arrangement, not sit on top of it. One moment — the Researcher is on the weekend, Logistics on hotels, Experience on hospitality, and Budget is sizing the whole thing against your cap.*

**The workspace materialises**, card by card — an itinerary across three days, three hospitality tiers with pricing per person, three hotels ranked by distance to the marina gate, a research scratchpad showing four iterations with findings and citations, a pricing breakdown sized to the cap, and a row of refinement chips.

**You click `Closer to the pit lane`**. The ribbon shows `Concierge → Experience` only — not the full fan-out again. The concierge replies:

> *Pit-lane it is. Paddock Club tends to win on this dimension — forty minutes on the Thursday walk alone — though Trophy keeps a calmer lounge if the group wants a quieter day two.*

The tier cards rearrange in place; Paddock Club now sits first.

**You type `Please remember my partner is vegan`**. The ribbon shows `memory · write`. The concierge acknowledges without fuss:

> *Your partner's preference will thread itself into the hospitality kitchen, the hotel breakfast, and the in-flight meal on this trip — and every future one. You will not need to raise it again.*

Reload the page and that fact is still there. It's in localStorage, embedding-indexed, searchable.

**You click `Proceed`**. The ribbon shows `memory · read` (4 hits) — the preferences injected into the final assembly. The concierge:

> *Putting the dossier together now. It carries the arrangements, the kept-in-mind notes, and what happens next — forward-able as is.*

A **Dossier** card appears — three sections, meta row with guest count, total, window, and a short narrative. And a **Pricing Breakdown** card with a line per category. End of demo, under two minutes.

---

## Why this is different from a chatbot

| Most agent demos | Agent Concierge |
|---|---|
| One voice, flat replies | Coordinator + 5 named specialists, each with their own responsibility |
| Tools loaded at startup, all visible in system prompt | Tools registered as manifests; implementations `import()`-ed only when the owning skill activates |
| Single system prompt, ballooning as the conversation grows | System prompt starts slim; skills and memory are *pulled* on demand; older turns are compacted as the window fills |
| "I couldn't find any results" | The scripted Mock still calls real filters over real data — refinement chips actually re-rank |
| Cards rendered from Markdown the model wrote | A2UI — the agent emits typed component JSON; the frontend renders from a safe, pre-approved catalog with its own design tokens |
| "Please wait, I'm thinking…" | An Activity Ribbon that shows skill loads, tool calls, sub-agent hand-offs, memory reads and writes, research iterations, and context compactions as they happen |
| Purple-gradient backgrounds, sparkle icons, emoji | A restrained dark-first palette, champagne as the single accent, Fraunces display + Geist UI, 8pt grid, spring physics — and nothing called a "Package" |

This is the kind of thing that does not make it into a two-slide architecture deck, because you have to *feel* it to see why it matters.

---

## The seven ideas it demonstrates

| # | Idea | Made visible as |
|---|---|---|
| 1 | **Multi-agent orchestration** (ADK-shaped) | `Concierge → {Researcher, Logistics, Experience, Budget, Personalizer}` chips in the ribbon |
| 2 | **Advanced tool use** | Parallel fan-out, typed JSON-Schema, structured errors — and *real* filters over *real* data even in Mock mode |
| 3 | **Tool-loading architecture** | Manifests in a catalog; implementations lazy-loaded per-skill; `tool · load` events in the ribbon |
| 4 | **Skills** | Reusable bundles of *instructions + tools + resources*; `skill · event-catalog` chips appear as the agent pulls them |
| 5 | **Memory** | Session + embedding-backed long-term store; `memory · read` / `memory · write` visible; Settings shows every fact |
| 6 | **Deep research** | A `LoopAgent` (plan → search → critique → refine) emitting a live scratchpad with sub-questions, findings, citations |
| 7 | **Progressive disclosure + long-context discipline** | UX reveals only what's asked for; the coordinator starts lean and *pulls* context; a context meter tracks token usage and compacts older turns |

---

## Architecture at a glance

```
                             ┌─────────────────────────┐
                     user ─▶ │ Concierge (coordinator) │  ◀── skills: event-catalog,
                             └───────────┬─────────────┘       dietary-accessibility
                                         │
                      ┌──── agent-as-tool (A2A-shaped) ────┐
                      ▼                                    ▼
   ┌─────────────┬───────────────┬───────────────┬─────────────────┐
   │             │               │               │                 │
   ▼             ▼               ▼               ▼                 ▼
Researcher   Logistics       Experience        Budget          Personalizer
(LoopAgent)  hotels,         hospitality      pricing          memory recall,
plan→search  flights,        tiers,           breakdown        gifting
→critique    transfers       insider access                    narrative
→refine


     ┌──────────────────────┬────────────────────────┬─────────────────────┐
     │                      │                        │                     │
Tool Catalog          Skill Registry          Memory Service         Context Budget
manifests loaded      on-demand bundles       embeddings-indexed     compact older turns
`import()`-ed when    of instructions +       localStorage store     before the window fills
a skill activates     tools + resources


                             ┌─────────────────────────┐
                             │      A2UI Renderer      │
                             └─────────────────────────┘
                itinerary · option_card_grid · comparison_table · pricing_breakdown
              · research_scratchpad · map_preview · dossier · refinement_chips · note
```

Everything above is implemented in `src/adk/` as a deliberately small, didactic framework — about **900 lines** of TypeScript — that mirrors Google ADK's primitives. ADK itself is server-side; this repo is a browser-friendly reference for teams who want to learn the shape.

---

## The ADK layer, in code

Two primitives, two lines each, is enough to get the idea across.

**Defining a specialist:**

```ts
const experience = new LlmAgent({
  name: 'Experience',
  description: 'Hospitality tiers — paddock, debenture, pavilion, corporate suites.',
  skills: ['hospitality-tiers'],                       // pulled in on demand
  systemPrompt: `You are the Experience specialist. Use tiers_for_event to
    surface three tiers that genuinely differ. Copy is understated; never
    promise, always arrange.`,
})
```

**A skill — instructions + tools bundled together, lazy-loaded:**

```ts
export const hospitalityTiersSkill: Skill = {
  name: 'hospitality-tiers',
  description: 'Know what each tier includes — paddock, debenture, pavilion.',
  instructions: `Explain tiers in human terms: what the guest will see,
    taste, and experience. Never recommend a tier without saying what's
    included.`,
  tools: [
    defineLazyTool(
      { name: 'tiers_for_event', description: '…', input: { /* JSON-Schema */ } },
      async () => defineTool(/* implementation loaded only when called */),
    ),
  ],
}
```

**Coordinator wiring sub-agents as tools:**

```ts
const concierge = new LlmAgent({
  name: 'Concierge',
  subAgents: [researcher, logistics, experience, budget, personalizer],
  skills: ['event-catalog', 'dietary-accessibility'],
  systemPrompt: `You are the Concierge — the only voice the guest hears…
    delegate to Researcher, Logistics, Experience, Budget, and Personalizer
    in parallel via the agent-as-tool interface.`,
})
```

**Running a turn:**

```ts
await run(concierge, userInput, runtime, {
  session,
  onTrace:    (t) => ribbon.push(t),      // skill.load, tool.call, memory.read, …
  onArtifact: (a) => workspace.push(a),   // itinerary, option_card_grid, …
  onDelta:    (text) => chat.append(text),
})
```

That is the entire public surface. The runner handles skill loading, tool dispatch, sub-agent delegation (with their artifacts bubbling into the same workspace), memory injection, context compaction, and streaming — and stays under 300 lines.

See `src/adk/runner.ts` for the implementation. It is the one file worth reading end-to-end.

---

## Two modes

<table>
<tr>
<td width="50%" valign="top">

### Mock <small>· default</small>

Deterministic. Scripted. Zero network.

Scenarios live in `src/scenarios/`. Each *beat* decides what the coordinator says and which specialists it calls — but **the tools themselves run for real**, filtering the hotel catalog, ranking hospitality tiers, computing pricing. Refinement chips actually re-filter.

This is the mode to demo live.

</td>
<td width="50%" valign="top">

### Live <small>· Gemini 3 Flash</small>

Reads `VITE_GEMINI_API_KEY` from `.env.local`. Routes through `@google/genai` to **Gemini 3 Flash** — 1M-token context, multimodal, configurable thinking.

The agent topology, skills, memory service, A2UI renderer, and activity ribbon are **identical** — only the provider swaps.

```sh
cp .env.example .env.local
# set VITE_GEMINI_API_KEY=…
./app.sh restart
```

Browser-exposed keys are a prototype-only pattern.

</td>
</tr>
</table>

---

## Run it

```sh
./app.sh start          # install deps if needed, start dev server, wait until ready
./app.sh stop           # shut it down
./app.sh restart        # the obvious
./app.sh status         # show state + URL
./app.sh logs           # tail the dev server log
./app.sh build          # production build into dist/

PORT=5174 ./app.sh start
```

Under the hood, `./app.sh start` runs `npm install` the first time and `npm run dev` after that. No magic.

Direct npm commands also work:

```sh
npm install
npm run dev             # http://localhost:5173
npm run typecheck       # tsc -b
npm run test            # vitest — 7 tests covering orchestration + memory
npm run build
```

**Prerequisites**: Node 20+. That is it.

---

## Three canonical scenarios

All baked into Mock mode. Each uses the same agents, skills, and A2UI renderer — only the scripts differ.

**F1 Abu Dhabi · corporate gifting.** Four guests, one wheelchair, ₹50L budget, late November. Demonstrates: accessibility threading, parallel dispatch, pit-lane refinement, paddock-meet insider, "remember my partner is vegan", proceed → dossier.

**Wimbledon · family fortnight.** Three adults, three children, five nights, V&A and a West End matinee woven in, pavilion dietary brief. Demonstrates: family-friendly shape, Centre Court debenture upgrade path, cultural day included in the itinerary.

**Wankhede Test · corporate hospitality.** Group of ten, first-time travelling together, Mumbai, weather buffer. Demonstrates: group dynamics, insider briefing window (former captain), contingency planning.

---

## Concept glossary

A short reference for readers new to agentic architectures — the vocabulary every system worth building in 2026 rests on.

<dl>
<dt><strong>Coordinator</strong></dt>
<dd>An <code>LlmAgent</code> whose job is to <em>route</em> work, not do it. In ADK, sub-agents are exposed as tools so calls route through the coordinator — the guest sees one voice.</dd>

<dt><strong>Agent-as-tool</strong></dt>
<dd>Wrapping a sub-agent so the coordinator can invoke it as just another function call. Unlike hand-offs, the coordinator retains agency and merges results. Also the shape of the emerging <em>A2A</em> (Agent-to-Agent) protocol.</dd>

<dt><strong>Skill</strong></dt>
<dd>A bundle of <em>instructions + tools + (optional) resources</em> that only attaches when the coordinator decides it is needed. Keeps the prompt lean and makes tool-loading a first-class, visible concept.</dd>

<dt><strong>Tool</strong></dt>
<dd>A typed function with a JSON-Schema input. Registered as a manifest; implementation loaded via dynamic <code>import()</code> when about to be called. Parallel fan-out is the default.</dd>

<dt><strong>Memory Service</strong></dt>
<dd>A long-term store with embedding-indexed search. <code>add()</code> ingests a fact; <code>search()</code> retrieves top-k by cosine similarity. Backed by localStorage here; production wiring would use Vertex AI Memory Bank or Firestore.</dd>

<dt><strong>A2UI</strong></dt>
<dd>Google's emerging <a href="https://a2ui.org">Agent-to-UI protocol</a>. The agent emits declarative component JSON; the frontend renders from a pre-approved catalog. Safer than arbitrary HTML; more portable than screenshots; interactive by default.</dd>

<dt><strong>Workflow agents</strong></dt>
<dd><code>SequentialAgent</code>, <code>ParallelAgent</code>, <code>LoopAgent</code> — deterministic composers that arrange <code>LlmAgent</code>s into pipelines. Used inside the Researcher to make the deep-research loop visible.</dd>

<dt><strong>Context budget</strong></dt>
<dd>Approximate measurement of tokens in the live window. When usage crosses a soft fraction of the budget, older turns are compacted into a short summary. Discipline even with a 1M-token model.</dd>

<dt><strong>Progressive disclosure</strong></dt>
<dd>A UX pattern (workspace reveals detail only as asked) <em>and</em> a prompting pattern (agents pull skills, tools, and memory rather than having everything pre-loaded). Makes agents feel deliberate instead of verbose.</dd>
</dl>

---

## Structure

```
Agentic-Concierge/
├── app.sh                   — one-shot start/stop/restart/status/logs/build
├── index.html
├── package.json  vite.config.ts  tsconfig.*.json
├── DESIGN.md                — the visual language, with reasoning
├── LICENSE
├── README.md                — this file
└── src/
    ├── main.tsx  App.tsx
    ├── styles/tokens.css    — OKLCH palette, type scale, motion presets
    ├── adk/                 — the ADK-shaped emulation layer (~900 LOC)
    │   ├── agent.ts  workflow.ts  tool.ts  skill.ts
    │   ├── memory.ts  context-budget.ts  callbacks.ts
    │   ├── a2ui.ts  types.ts  provider.ts  runner.ts
    │   └── providers/
    │       ├── mock.ts      — scripted beat-driven provider
    │       └── gemini.ts    — @google/genai live adapter
    ├── agents/              — concierge + five specialists
    ├── skills/              — five on-demand skill bundles
    ├── data/                — events, hotels, hospitality, flights, personas
    ├── scenarios/           — f1-abu-dhabi, wimbledon, cricket scripts
    ├── ui/
    │   ├── Shell · ChatPane · Workspace · ActivityRibbon · SettingsSheet · Topbar
    │   ├── a2ui/            — one React component per A2UI kind
    │   ├── components/      — Button · Chip · Kbd · Panel
    │   └── motion/          — shared transition presets
    ├── state/store.ts       — zustand app state
    ├── lib/                 — cn, format helpers
    └── tests/               — vitest (7 tests)
```

---

## On vocabulary

The product never says *book*, *click here*, *purchase*, *VIP experience*, or *package*. The concierge *arranges* and *curates*; the guest *holds* an option; a trip is a *weekend* or a *journey*. This is a deliberate choice — the voice is a tool. A luxury concierge isn't selling; they're anticipating.

And: no exclamation marks. No emoji. No "Loading…" spinner. The agent shows its work through the Activity Ribbon, not through fake enthusiasm.

---

## On the visual language

Dark-first. OKLCH palette. One accent — a warm champagne. One trace-teal. Fraunces for editorial display; Geist for UI. 8pt grid, always. `motion/react` springs at `stiffness: 260, damping: 28`, durations 150–280ms. One 1px champagne hairline under the app title that tracks the active agent.

What it is *not*: purple→blue gradients, sparkle icons, rainbow borders, nested cards, emoji-heavy copy, or 1000ms transitions. If you recognise those as AI-slop signals, we agree.

See `DESIGN.md` for the full tokens and reasoning.

---

## Tech stack

Vite + React 19 + TypeScript · Tailwind 4 (OKLCH-native) · `motion/react` v12 · Radix primitives for dialog/slider/popover · Lucide icons · Zustand · `@google/genai` for Live · Vitest.

**~2,200 LOC of application code.** Zero external backend.

---

## What this is *not*

- Not production-ready. Browser-exposed API keys are a prototype pattern only.
- Not a complete concierge platform. No booking system, no payment, no real inventory.
- Not a finished ADK port. ADK itself is server-side; this is a browser-friendly reference.
- Not a universal UI kit. The A2UI renderer is tuned for this domain. Fork it and tune the catalog to yours.

---

## Roadmap, if you're forking

- Swap the hash embedder for Gemini's `gemini-embedding-001` in Live mode for actual semantic recall.
- Wire the Memory Service to Vertex AI Memory Bank or Firestore for cross-device persistence.
- Add a Comparison-mode A2UI component that folds multiple `option_card_grid`s into one `comparison_table`.
- Introduce a peer agent over A2A for a real booking system so the Concierge hands off actual commitments.
- Stream multimodal inputs (an event flyer image, a voice note) into the coordinator via Gemini 3 Flash's multimodal support.
- Snapshot-test the A2UI artifact output for visual-regression coverage.

---

## License

MIT. See `LICENSE`. Use, fork, adapt — attribution appreciated but not required.

---

<div align="center">

<sub>Built by <a href="https://github.com/vmishra">Vikas Mishra</a> · <a href="https://github.com/vmishra/Agentic-Concierge">github.com/vmishra/Agentic-Concierge</a></sub>

</div>
