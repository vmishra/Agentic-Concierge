import { describe, expect, test } from 'vitest'
import { run } from '@/adk/runner'
import { ToolCatalog } from '@/adk/tool'
import { HashEmbedder, MemoryService } from '@/adk/memory'
import { buildSkillRegistry } from '@/skills'
import { buildAgents } from '@/agents'
import { MockProvider } from '@/adk/providers/mock'
import { f1AbuDhabiScript } from '@/scenarios/f1-abu-dhabi'
import type { A2UIArtifact } from '@/adk/a2ui'
import type { Session, TraceEntry } from '@/adk/types'

function makeRuntime() {
  const provider = new MockProvider({ script: f1AbuDhabiScript, charDelayMs: 0, stepDelayMs: 0 })
  const { concierge } = buildAgents({ provider })
  const catalog = new ToolCatalog()
  concierge.primeCatalog(catalog)
  // Share provider across the agent tree
  const attach = (a: typeof concierge) => {
    ;(a as unknown as { provider?: typeof provider }).provider ??= provider
    for (const s of a.subAgents) attach(s)
  }
  attach(concierge)
  return {
    provider,
    concierge,
    runtime: {
      provider,
      catalog,
      skills: buildSkillRegistry(),
      memory: new MemoryService(makeBackend(), new HashEmbedder()),
    },
  }
}

function makeBackend() {
  const store: { id: string; text: string; vector: number[]; createdAt: number }[] = []
  return {
    all: () => store,
    upsert: (f: { id: string; text: string; vector: number[]; createdAt: number }) => store.push(f),
    clear: () => {
      store.length = 0
    },
  }
}

describe('F1 Abu Dhabi orchestration — mock mode', () => {
  test('initial request delegates to specialists and assembles an itinerary', async () => {
    const { concierge, runtime } = makeRuntime()
    const session: Session = { id: 'test', messages: [], state: {} }
    const artifacts: A2UIArtifact[] = []
    const traces: TraceEntry[] = []

    await run(concierge, 'We are four travellers heading to F1 Abu Dhabi in November. One of us uses a wheelchair. Budget ~₹50L.', runtime, {
      session,
      onArtifact: (a) => artifacts.push(a),
      onTrace: (t) => traces.push(t),
    })

    const kinds = artifacts.map((a) => a.kind)
    expect(kinds).toContain('research_scratchpad')
    expect(kinds).toContain('option_card_grid')
    expect(kinds).toContain('pricing_breakdown')
    expect(kinds).toContain('itinerary')

    // The ribbon should show multi-agent dispatch + return events
    const dispatches = traces.filter((t) => t.event.kind === 'agent.dispatch').map((t) => (t.event as { to: string }).to)
    expect(dispatches).toEqual(expect.arrayContaining(['Researcher', 'Logistics', 'Experience', 'Budget']))

    // Skill loads should fire
    const skillLoads = traces.filter((t) => t.event.kind === 'skill.load').map((t) => (t.event as { skill: string }).skill)
    expect(skillLoads).toEqual(expect.arrayContaining(['event-catalog']))

    // Real tool calls happened — the Experience sub-agent uses `tiers_for_event`
    const toolCalls = traces.filter((t) => t.event.kind === 'tool.call').map((t) => (t.event as { tool: string }).tool)
    expect(toolCalls).toEqual(expect.arrayContaining(['tiers_for_event', 'hotels_near_event', 'search_events']))

    // Itinerary must carry refinement chips
    const itinerary = artifacts.find((a) => a.kind === 'itinerary')!
    expect(itinerary.kind).toBe('itinerary')
    if (itinerary.kind === 'itinerary') {
      expect(itinerary.refinements?.length ?? 0).toBeGreaterThan(0)
    }
  })

  test('refinement chip triggers only the Experience specialist', async () => {
    const { concierge, runtime } = makeRuntime()
    const session: Session = { id: 'test2', messages: [], state: {} }

    // First turn — full dispatch
    await run(concierge, 'F1 Abu Dhabi plan for four, budget ₹50L', runtime, { session })

    // Second turn — refinement
    const artifacts: A2UIArtifact[] = []
    const traces: TraceEntry[] = []
    await run(concierge, 'Closer to the pit lane', runtime, {
      session,
      onArtifact: (a) => artifacts.push(a),
      onTrace: (t) => traces.push(t),
    })

    const dispatches = traces.filter((t) => t.event.kind === 'agent.dispatch').map((t) => (t.event as { to: string }).to)
    expect(dispatches).toEqual(['Experience'])

    // A new option_card_grid should have been emitted
    expect(artifacts.some((a) => a.kind === 'option_card_grid')).toBe(true)
  })

  test('asking to remember a fact writes to memory', async () => {
    const { concierge, runtime } = makeRuntime()
    const session: Session = { id: 'test3', messages: [], state: {} }

    await run(concierge, 'F1 Abu Dhabi plan for four', runtime, { session })

    const traces: TraceEntry[] = []
    await run(concierge, 'Please remember that my partner is vegan.', runtime, {
      session,
      onTrace: (t) => traces.push(t),
    })

    const writes = traces.filter((t) => t.event.kind === 'memory.write')
    expect(writes.length).toBeGreaterThanOrEqual(1)
  })

  test('proceed produces a dossier and pricing breakdown', async () => {
    const { concierge, runtime } = makeRuntime()
    const session: Session = { id: 'test4', messages: [], state: {} }

    await run(concierge, 'F1 Abu Dhabi plan for four', runtime, { session })

    const artifacts: A2UIArtifact[] = []
    await run(concierge, 'Let\'s proceed.', runtime, {
      session,
      onArtifact: (a) => artifacts.push(a),
    })

    expect(artifacts.some((a) => a.kind === 'dossier')).toBe(true)
    expect(artifacts.some((a) => a.kind === 'pricing_breakdown')).toBe(true)
  })
})
