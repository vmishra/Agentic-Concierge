/**
 * The multi-agent topology.
 *
 *                  ┌─────────────────────────┐
 *        user ───▶ │ Concierge (coordinator) │
 *                  └───────────┬─────────────┘
 *                              │ delegates via AgentTool
 *     ┌────────────┬───────────┴──────────┬────────────┬─────────────┐
 *     ▼            ▼                      ▼            ▼             ▼
 *  Researcher  Logistics            Experience      Budget      Personalizer
 *  (LoopAgent) (hotels/flights/     (hospitality   (pricing    (memory-backed
 *              transfers)            tiers/         breakdown)  preferences +
 *                                    insider)                   gifting
 *                                                               narrative)
 *
 * The coordinator is the only voice the user hears. Specialists emit their own
 * artifacts into the same workspace, but their text outputs are collapsed into
 * short summaries returned to the coordinator.
 */

import { LlmAgent } from '@/adk/agent'
import type { Provider } from '@/adk/provider'

export interface BuildAgentOptions {
  provider: Provider
}

export function buildAgents(_opts: BuildAgentOptions) {
  const researcher = new LlmAgent({
    name: 'Researcher',
    shortName: 'researcher',
    description:
      'Deep research specialist — iterates plan → search → critique → refine to produce a consolidated brief with citations.',
    skills: ['event-catalog'],
    thinking: 'medium',
    systemPrompt: `You are the Researcher. Iterate no more than four sub-questions (plan → search → critique → refine). Emit a research_scratchpad artifact and return a short brief — never more than 3 crisp sentences.`,
  })

  const logistics = new LlmAgent({
    name: 'Logistics',
    shortName: 'logistics',
    description: 'Hotels, flights, and transfers near an event venue — accessibility first.',
    skills: ['travel-logistics', 'dietary-accessibility'],
    thinking: 'low',
    systemPrompt: `You are the Logistics specialist. Use \`hotels_near_event\` and \`find_flights\`. Emit an option_card_grid with three hotels max. Flag accessibility when relevant. Short text — the UI is the output.`,
  })

  const experience = new LlmAgent({
    name: 'Experience',
    shortName: 'experience',
    description: 'Hospitality tiers — paddock, debenture, pavilion, corporate suites.',
    skills: ['hospitality-tiers'],
    thinking: 'medium',
    systemPrompt: `You are the Experience specialist. Use \`tiers_for_event\` and \`tier_detail\` to surface three tiers that genuinely differ. Copy is understated; never promise, always arrange.`,
  })

  const budget = new LlmAgent({
    name: 'Budget',
    shortName: 'budget',
    description: 'Pricing, optimisation, and plain explanations of where the money goes.',
    skills: [],
    thinking: 'low',
    systemPrompt: `You are Budget. Produce a pricing_breakdown artifact grouped by hospitality, hotel, flights, and service. Call out one upgrade and one downgrade path in the note.`,
  })

  const personalizer = new LlmAgent({
    name: 'Personalizer',
    shortName: 'personalizer',
    description: 'Memory, preferences, and gifting narrative.',
    skills: ['gifting-narrative'],
    thinking: 'low',
    systemPrompt: `You are the Personalizer. Pull relevant preferences from memory. If the request has a gifting angle, emit a short, understated narrative note. Never use exclamation marks.`,
  })

  const concierge = new LlmAgent({
    name: 'Concierge',
    shortName: 'concierge',
    description:
      'The voice of the service. Orchestrates specialists, holds the guest\'s intent, and assembles the final itinerary, pricing, and dossier.',
    skills: ['event-catalog', 'dietary-accessibility'],
    subAgents: [researcher, logistics, experience, budget, personalizer],
    thinking: 'high',
    systemPrompt: [
      'You are the Concierge — the only voice the guest hears. Your tone is understated, specific, and anticipatory.',
      'You arrange and curate; you never book or sell. You never use exclamation marks.',
      'When a request arrives, delegate to the Researcher, Logistics, Experience, Budget, and Personalizer sub-agents in parallel via the agent-as-tool interface.',
      'When all specialists return, assemble a single itinerary artifact plus refinement_chips. Keep your own prose short — the workspace carries the detail.',
      'When the guest refines, call only the specialist that owns that surface. Do not redo work that did not change.',
      'When the guest tells you to remember something, write to long-term memory and acknowledge in one sentence.',
      'When the guest says proceed, draft a dossier artifact and a pricing_breakdown; say what happens next in two sentences.',
    ].join('\n'),
  })

  return { concierge, researcher, logistics, experience, budget, personalizer }
}
