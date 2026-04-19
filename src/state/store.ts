import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { A2UIArtifact } from '@/adk/a2ui'
import { ToolCatalog } from '@/adk/tool'
import type { Message, Session, TraceEntry } from '@/adk/types'
import type { Provider } from '@/adk/provider'
import { HashEmbedder, LocalMemoryBackend, MemoryService, type Embedder } from '@/adk/memory'
import { approxTokens } from '@/adk/context-budget'
import type { SkillRegistry } from '@/adk/skill'
import { buildSkillRegistry as buildSkills } from '@/skills'
import { buildAgents } from '@/agents'
import type { LlmAgent } from '@/adk/agent'
import { MockProvider } from '@/adk/providers/mock'
import { allScenarios } from '@/scenarios'
import { recomputePricing } from '@/scenarios/pricing'
import { run } from '@/adk/runner'
import { defaultPersona } from '@/data/personas'

export type Mode = 'mock' | 'live'
export type Theme = 'dark' | 'light'

interface PersistedSettings {
  mode: Mode
  theme: Theme
  seeded: boolean
  apiKey?: string
}

interface Runtime {
  provider: Provider
  concierge: LlmAgent
  catalog: ToolCatalog
  skills: SkillRegistry
  memory: MemoryService
  embedder: Embedder
}

interface AppState {
  settings: PersistedSettings
  messages: Message[]
  artifacts: A2UIArtifact[]
  traces: TraceEntry[]
  session: Session
  runtime: Runtime
  activeAgent?: string
  isStreaming: boolean
  abortController?: AbortController
  tokensUsed: number
  tokenBudget: number

  sendMessage: (text: string) => Promise<void>
  refine: (label: string, prompt?: string) => Promise<void>
  selectOption: (artifactId: string, optionId: string) => void
  setMode: (mode: Mode) => void
  setTheme: (theme: Theme) => void
  setApiKey: (key: string) => void
  resetConversation: () => void
  clearMemory: () => void
  rememberFact: (text: string) => Promise<void>
  cancel: () => void
}

function newSession(): Session {
  return { id: crypto.randomUUID(), messages: [], state: {} }
}

async function buildRuntime(mode: Mode, apiKey?: string): Promise<Runtime> {
  const catalog = new ToolCatalog()
  const skills = buildSkills()
  const embedder: Embedder = new HashEmbedder()
  const memory = new MemoryService(new LocalMemoryBackend(), embedder)

  let provider: Provider
  let liveEmbedder: Embedder | undefined
  if (mode === 'live' && apiKey) {
    const { GeminiProvider } = await import('@/adk/providers/gemini')
    const gp = new GeminiProvider({ apiKey, model: 'gemini-3-flash', embedding: 'gemini-embedding-2' })
    provider = gp
    liveEmbedder = { dim: 768, embed: (texts) => gp.embed(texts) }
  } else {
    // Demo pacing — slow enough that a viewer can watch each skill load,
    // sub-agent dispatch, and artifact land without missing a beat.
    provider = new MockProvider({ script: allScenarios, charDelayMs: 18, stepDelayMs: 420 })
  }
  if (liveEmbedder) {
    // Swap the memory service to use Gemini embeddings.
    Object.assign(memory, { embedder: liveEmbedder })
  }

  const { concierge } = buildAgents({ provider })
  // Share provider across the whole agent tree (subAgents default to the root provider).
  attachProvider(concierge, provider)
  concierge.primeCatalog(catalog)
  return { provider, concierge, catalog, skills, memory, embedder }
}

function attachProvider(agent: LlmAgent, provider: Provider) {
  // Mutate the readonly-in-type provider field so sub-agents share the same one.
  const a = agent as unknown as { provider?: Provider }
  if (!a.provider) a.provider = provider
  for (const s of agent.subAgents) attachProvider(s, provider)
}

const DEFAULT_BUDGET = 1_000_000
const initialRuntime: Runtime = (() => {
  const catalog = new ToolCatalog()
  const skills = buildSkills()
  const embedder = new HashEmbedder()
  const memory = new MemoryService(new LocalMemoryBackend(), embedder)
  const provider = new MockProvider({ script: allScenarios, charDelayMs: 18, stepDelayMs: 420 })
  const { concierge } = buildAgents({ provider })
  attachProvider(concierge, provider)
  concierge.primeCatalog(catalog)
  return { provider, concierge, catalog, skills, memory, embedder }
})()

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      settings: { mode: 'mock', theme: 'dark', seeded: false },
      messages: [],
      artifacts: [],
      traces: [],
      session: newSession(),
      runtime: initialRuntime,
      activeAgent: undefined,
      isStreaming: false,
      tokensUsed: 0,
      tokenBudget: DEFAULT_BUDGET,

      async sendMessage(text) {
        if (!text.trim() || get().isStreaming) return
        const abort = new AbortController()
        set({ isStreaming: true, abortController: abort, activeAgent: 'Concierge' })

        const { runtime, session, settings } = get()
        if (!settings.seeded) {
          for (const line of defaultPersona.seedMemory) {
            await runtime.memory.add(line, { source: 'seed' }).catch(() => undefined)
          }
          set((s) => ({ settings: { ...s.settings, seeded: true } }))
        }

        try {
          await run(runtime.concierge, text, runtime, {
            session,
            onTrace: (t) => set((s) => ({ traces: [...s.traces, t] })),
            onArtifact: (a) =>
              set((s) => {
                const i = s.artifacts.findIndex((x) => x.id === a.id)
                if (i >= 0) {
                  const next = [...s.artifacts]
                  next[i] = a
                  return { artifacts: next }
                }
                return { artifacts: [...s.artifacts, a] }
              }),
            onDelta: () => set({ messages: [...session.messages] }),
            onDone: () => set({ messages: [...session.messages] }),
            signal: abort.signal,
          })
        } catch (err) {
          console.error(err)
        } finally {
          const used = session.messages.reduce((n, m) => n + approxTokens(m.content), 0)
          set({
            isStreaming: false,
            abortController: undefined,
            activeAgent: undefined,
            tokensUsed: used,
            messages: [...session.messages],
          })
        }
      },

      async refine(label, prompt) {
        await get().sendMessage(prompt ?? label)
      },

      selectOption(artifactId, optionId) {
        set((s) => {
          const withSelection = s.artifacts.map((a) => {
            if (a.id !== artifactId || a.kind !== 'option_card_grid') return a
            return { ...a, options: a.options.map((o) => ({ ...o, selected: o.id === optionId })) }
          })
          // Rebuild any pricing_breakdown that depends on this selection so
          // the total tracks the guest's choice (hotel or tier) in real time.
          return { artifacts: recomputePricing(withSelection) }
        })
      },

      async setMode(mode) {
        const { apiKey } = get().settings
        set((s) => ({
          settings: { ...s.settings, mode },
          messages: [],
          artifacts: [],
          traces: [],
          session: newSession(),
          tokensUsed: 0,
        }))
        const rt = await buildRuntime(mode, apiKey)
        set({ runtime: rt })
      },

      setTheme(theme) {
        set((s) => ({ settings: { ...s.settings, theme } }))
        document.documentElement.setAttribute('data-theme', theme)
      },

      setApiKey(key) {
        set((s) => ({ settings: { ...s.settings, apiKey: key } }))
      },

      resetConversation() {
        get().cancel()
        set((s) => ({
          messages: [],
          artifacts: [],
          traces: [],
          session: newSession(),
          tokensUsed: 0,
          settings: { ...s.settings, seeded: false },
        }))
      },

      clearMemory() {
        get().runtime.memory.clear()
      },

      async rememberFact(text) {
        await get().runtime.memory.add(text, { source: 'user' })
      },

      cancel() {
        const a = get().abortController
        if (a) a.abort()
        set({ isStreaming: false, abortController: undefined, activeAgent: undefined })
      },
    }),
    {
      name: 'agentic-concierge:settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings }),
      onRehydrateStorage: () => (state) => {
        if (state?.settings.theme) document.documentElement.setAttribute('data-theme', state.settings.theme)
      },
    },
  ),
)

export type { SkillRegistry }
