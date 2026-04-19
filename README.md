# Agent Concierge

> A working prototype of what bespoke, agent-driven experiential travel planning feels like in 2026 — multi-agent, multi-skill, memory-aware, long-context-disciplined, and deliberately understated.

Agent Concierge is a **reference prototype**, not a production app. It runs entirely in the browser, with no backend, and is meant to be forked by teams building real concierge systems. The goal is to show — clearly and tastefully — how a modern agentic system *feels* when the pieces are wired together: a coordinator delegating to specialists, skills being loaded on demand, memory quietly personalising the recommendation, a workspace that materialises as the conversation unfolds.

<p align="left">
  <img alt="Mode · Mock or Live Gemini 3 Flash" src="https://img.shields.io/badge/mode-mock%20%7C%20live-1a1815?style=flat-square&labelColor=2a2620">
  <img alt="Framework · ADK-shaped" src="https://img.shields.io/badge/framework-ADK--shaped-1a1815?style=flat-square&labelColor=2a2620">
  <img alt="Model · Gemini 3 Flash" src="https://img.shields.io/badge/model-Gemini%203%20Flash-1a1815?style=flat-square&labelColor=2a2620">
  <img alt="UI · A2UI generative components" src="https://img.shields.io/badge/ui-A2UI%20generative-1a1815?style=flat-square&labelColor=2a2620">
</p>

---

## The premise

Most agent demos today are either bare chat interfaces or backend-heavy “Deep Research” clones. Neither captures the way a great human concierge actually works — consulting specialists, juggling availability across vendors, remembering your partner is vegan, and surfacing a single, considered option without making you feel the plumbing.

This prototype is an attempt to show what a *multi-agent* concierge can feel like when you treat the interface as part of the agent — with generative UI, visible agent activity, progressive disclosure, and an understated visual language that never tips into AI-slop territory.

It is built in the *spirit* of Google's [Agent Development Kit (ADK)](https://google.github.io/adk-docs): the framework itself is server-side, but the primitives it teaches — **Agents, Tools, Skills, Memory, Workflow agents, Callbacks, Runners** — translate cleanly to a browser-only demo when you implement them yourself, which is exactly what this repo does.

---

## What it demonstrates

Seven ideas, each made visible on screen:

| # | Concept | How you see it |
|---|---|---|
| 1 | **Multi-agent orchestration** | A single Concierge coordinator delegates to specialists (Researcher, Logistics, Experience, Budget, Personalizer) via an agent-as-tool interface. The Activity Ribbon shows each hand-off. |
| 2 | **Advanced tool usage** | Parallel tool fan-out, typed JSON-Schema signatures, structured errors, and a real catalog behind every call — the mocked refinements actually re-filter data. |
| 3 | **Tool-loading architecture** | Tools live in a manifest-only catalog and are `import()`-loaded only when a skill activates. Viewers can *see* the toolbelt expand as the conversation progresses. |
| 4 | **Skills** | Reusable bundles of *instructions + tools + resources*, loaded on demand. `skill · event-catalog` chips appear as the agent pulls what it needs. |
| 5 | **Memory** | Session state + embedding-backed long-term memory (localStorage). `memory · write` and `memory · read` events surface in the ribbon; stored facts are visible and wipeable in Settings. |
| 6 | **Deep research** | A Researcher `LoopAgent` (plan → search → critique → refine) emits a live `research_scratchpad` artifact with sub-questions, findings, and citations. |
| 7 | **Progressive disclosure + long-context discipline** | The agent starts with a slim prompt and *pulls* skills/memory into context only when needed. A context meter in the top chrome shows token use; a `Compactor` rolls older turns into a short summary once the window crosses a soft threshold. |

---

## Architecture at a glance

```
                            ┌─────────────────────────┐
                    user ─▶ │ Concierge (coordinator) │  ◀─ skills: event-catalog,
                            └───────────┬─────────────┘      dietary-accessibility
                                        │ agent-as-tool (A2A-shaped)
          ┌────────────┬────────────────┼─────────────┬──────────────┐
          ▼            ▼                ▼             ▼              ▼
      Researcher   Logistics       Experience       Budget      Personalizer
      (LoopAgent)  hotels/         hospitality     pricing      gifting narrative,
      plan→search  flights/        tiers +         breakdown    memory recall
      →critique    transfers       insider

         ▲                                  ▲
         │    tool manifests, loaded        │    A2UI artifacts emitted
         │    on-demand per skill           │    into the workspace:
         │                                  │
        Tool Catalog                   A2UI Renderer
        (lazy load())                  itinerary · option_grid ·
                                       comparison · pricing ·
                                       research_scratchpad ·
                                       map · dossier · note

        Memory Service  ─  embeddings  ─  localStorage  ─  context budget
```

Everything above is implemented in `src/adk/` as a tiny, didactic ~900-LOC framework that mirrors ADK's primitives:

```
src/adk/
  types.ts         Message, TraceEvent, ProviderChunk, Session
  a2ui.ts          Typed generative-UI protocol
  tool.ts          ToolManifest, LazyTool, ToolCatalog
  skill.ts         Skill, SkillRegistry
  memory.ts        Embedder, MemoryService, HashEmbedder, cosine
  context-budget.ts  approxTokens, compactIfNeeded
  callbacks.ts     beforeModel, afterModel, afterTool hooks
  provider.ts      Provider interface (Mock ↔ Gemini)
  agent.ts         LlmAgent, AgentCard, agentAsTool
  workflow.ts      Sequential, Parallel, Loop (ADK-style composers)
  runner.ts        run(...) — streaming, tool dispatch, sub-agents
  providers/
    mock.ts        Scripted beat-driven provider
    gemini.ts      Live `@google/genai` adapter
```

The agents themselves are in `src/agents/`, skills in `src/skills/`, the A2UI React renderer in `src/ui/a2ui/`, and the scripted scenarios — F1 Abu Dhabi, Wimbledon, Wankhede Test — in `src/scenarios/`.

---

## Scenarios baked into Mock mode

Open the app and pick one of the three seeded prompts. Each flow runs end-to-end — dispatch, refinement, memory, pricing, dossier — without a network call:

1. **F1 Abu Dhabi · CXO gifting weekend** — 4 guests, one wheelchair, ₹50L budget.
2. **Wimbledon · family fortnight** — 3 adults + 3 children, dietary needs threaded in.
3. **Wankhede Test · corporate hospitality** — group of 10, weather buffer, insider briefing.

All three share the same specialists, the same skills, and the same A2UI renderer. Only the scripts — the *scenario beats* — differ.

---

## Two modes

The only switch that matters:

- **Mock** (default). Deterministic, scripted, zero network. The scripted beats decide what the Concierge *says* and which specialists it *calls*, but the tools themselves run for real (filtering the hotel catalog, ranking hospitality tiers, computing pricing). This is the mode to demo in front of a room full of people.
- **Live**. Reads `VITE_GEMINI_API_KEY` from `.env.local`, routes through `@google/genai` to **Gemini 3 Flash**, and lets the real model drive. The agent definitions, skills, memory, and A2UI contract are identical — only the provider swaps. Browser-exposed keys are prototype-only; for production, front the model through a backend or Firebase AI Logic.

---

## Run it

```sh
git clone https://github.com/vmishra/Agentic-Concierge
cd Agentic-Concierge
npm install
npm run dev          # open http://localhost:5173
```

Optional — for Live mode:

```sh
cp .env.example .env.local
# edit .env.local and set VITE_GEMINI_API_KEY=...
npm run dev
# then toggle Live in the Settings sheet (top right)
```

Other scripts:

```sh
npm run typecheck    # tsc -b
npm run test         # vitest run (7 tests, covers orchestration + memory)
npm run build        # production build → dist/
```

---

## The visual language

A deliberate choice: nothing that reads as *AI slop*. No purple→blue gradients, no sparkle icons, no rainbow borders. A single warm champagne accent. OKLCH palette, Geist + Fraunces typography, 8-point spacing, `motion/react` with spring physics. A single 1px champagne hairline under the app title quietly tracks the active agent. Full keyboard navigation, visible focus rings, `prefers-reduced-motion` honored.

See `DESIGN.md` for the full choices and reasoning.

---

## Concept glossary

A short reference for readers new to agentic architectures:

- **Coordinator** · An `LlmAgent` whose job is to route work, not do it. In ADK this is the "agent with sub-agents as tools" pattern — calls bubble up through the coordinator so the user sees one voice.
- **Agent-as-Tool** · Wrapping a sub-agent so the coordinator can invoke it as just another function call. Unlike hand-offs, the coordinator retains agency and merges results.
- **Skill** · A bundle of *instructions + tools + (optional) resources* that only attaches when the coordinator decides it's needed. Keeps context budgets lean.
- **Tool** · Typed function with a JSON-Schema input. Lazy-loaded; only imported when about to be called. Parallel fan-out is the default.
- **Memory Service** · Long-term store with embedding-indexed search. `add` ingests facts; `search` retrieves top-k by cosine similarity. Backed by localStorage in this prototype; production wiring would use Vertex AI Memory Bank or Firestore + a real embedding model.
- **A2UI** · Google's emerging [Agent-to-UI protocol](https://a2ui.org): the agent emits declarative component JSON; the frontend renders from a pre-approved catalog. Safer than arbitrary HTML; more portable than screenshots; interactive by default.
- **LoopAgent / SequentialAgent / ParallelAgent** · Deterministic workflow primitives that compose `LlmAgent`s — used here inside the Researcher to make the deep-research iteration visible.
- **Context budget** · An approximate measurement of the tokens in the live window. When usage crosses a soft fraction of the budget, older turns are compacted into a short summary so the live window stays lean — even with a 1M-token model.
- **Progressive disclosure** · Both a UX pattern (workspace reveals detail only as asked) and a prompting pattern (agents pull skills, tools, and memory rather than having everything pre-loaded). Makes agents feel deliberate instead of verbose.

---

## Structure

```
Agentic-Concierge/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.*.json
├── DESIGN.md              — visual-language notes
├── LICENSE
├── README.md              — this file
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/tokens.css  — OKLCH palette + type scale + motion
│   ├── adk/               — ADK-shaped emulation layer
│   │   ├── agent.ts
│   │   ├── workflow.ts
│   │   ├── tool.ts
│   │   ├── skill.ts
│   │   ├── memory.ts
│   │   ├── context-budget.ts
│   │   ├── callbacks.ts
│   │   ├── a2ui.ts
│   │   ├── types.ts
│   │   ├── provider.ts
│   │   ├── runner.ts
│   │   └── providers/
│   │       ├── mock.ts
│   │       └── gemini.ts
│   ├── agents/            — concierge + 5 specialists
│   ├── skills/            — 5 on-demand skill bundles
│   ├── data/              — events, hotels, hospitality, flights, personas
│   ├── scenarios/         — F1, Wimbledon, cricket scripts
│   ├── ui/                — Shell, ChatPane, Workspace, ActivityRibbon, SettingsSheet
│   │   ├── a2ui/          — one React component per A2UI kind
│   │   ├── components/    — Button, Chip, Kbd, Panel
│   │   └── motion/        — shared transition presets
│   ├── state/store.ts     — zustand app state
│   ├── lib/               — cn, format, small helpers
│   └── tests/             — vitest
└── public/
    └── favicon.svg
```

---

## Why the vocabulary matters

The copy in the product never says *book*, *click here*, *purchase*, or *VIP experience*. The concierge *arranges* and *curates*; the guest *holds* an option; a trip is a *weekend* or a *journey*, never a *package*. This is a deliberate choice — the voice is a tool. A luxury concierge isn't selling; they're anticipating.

This also means: no exclamation marks. No emoji. No "Loading…" spinner. The agent shows its work through the Activity Ribbon, not through fake enthusiasm.

---

## Tech stack

- **Vite + React 19 + TypeScript** — static build, hostable anywhere.
- **Tailwind 4** with OKLCH-native tokens.
- **`motion/react`** (v12) for spring-physics animation.
- **Radix primitives** for accessibility (dialog, slider, popover).
- **Lucide** icons (16px, 1.5 stroke, always line).
- **Zustand** for app state; localStorage for memory persistence.
- **`@google/genai`** for the Live Gemini 3 Flash path.
- **Vitest** for the tests.

~2,200 LOC of application code; zero external backend.

---

## What this is *not*

- Not production-ready. Browser-exposed API keys are a prototype pattern only.
- Not a complete concierge platform. No booking system, no payment, no real inventory.
- Not a finished ADK port. ADK itself is server-side; this is a browser-friendly reference that teaches the primitives.
- Not a universal UI kit. The A2UI renderer is tuned for this domain — itineraries, hospitality tiers, pricing breakdowns. Fork it and tune the component catalog to yours.

---

## Roadmap, if you're forking

- Swap the mock embedder for Gemini's `gemini-embedding-001` in Live mode.
- Replace `hashEmbedder` for live semantic recall and wire a Firestore-backed Memory Bank.
- Add a Comparison-mode A2UI component that folds multiple `option_card_grid`s into one `comparison_table`.
- Introduce an A2A peer agent for a booking system (hotels, airlines) so the Concierge hands off *actual* commitments.
- Stream multimodal inputs (image of an event flyer, voice note) into the coordinator via Gemini 3 Flash's multimodal support.
- Add Jest-style snapshot tests on A2UI artifact output for visual-regression coverage.

---

## License

MIT — see `LICENSE`.

---

## Acknowledgements

Built by [Vikas Mishra](https://github.com/vmishra). Grateful to the ADK docs and the broader A2A/A2UI ecosystem; the primitives here are adaptations, not inventions.
