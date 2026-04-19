import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'

/**
 * dietary-accessibility — a small, focused skill that turns a guest need into
 * a concrete arrangement. Pure logic + structured output; no external data.
 */
export const dietaryAccessibilitySkill: Skill = {
  name: 'dietary-accessibility',
  description: 'Translate dietary and accessibility needs into specific arrangements across venues.',
  instructions: `When the guest mentions any dietary preference or accessibility need, call \`plan_arrangements\` and weave the notes into your reply. Never treat these as an afterthought.`,
  tools: [
    defineLazyTool(
      {
        name: 'plan_arrangements',
        description: 'Translate dietary and accessibility needs into an action list per venue.',
        input: {
          type: 'object',
          properties: {
            notes: { type: 'string', description: 'Free-text description of guest needs.' },
            venues: { type: 'string', description: 'Comma-separated list (event, hotel, transfer).' },
          },
          required: ['notes'],
        },
        owner: 'dietary-accessibility',
      },
      async () =>
        defineTool(
          { name: 'plan_arrangements', description: '', input: { type: 'object', properties: {} } },
          async (args: { notes: string; venues?: string }) => {
            const notes = args.notes.toLowerCase()
            const actions: { venue: string; action: string }[] = []
            if (/wheel|mobility|accessibility/.test(notes)) {
              actions.push(
                { venue: 'hotel', action: 'request step-free suite + roll-in shower' },
                { venue: 'event', action: 'confirm wheelchair-accessible seating and lift-access route to hospitality' },
                { venue: 'transfer', action: 'book a low-floor vehicle with ramp' },
              )
            }
            if (/vegan|plant/.test(notes)) {
              actions.push({ venue: 'hotel', action: 'arrange plant-based breakfast + in-room dining menu' })
              actions.push({ venue: 'event', action: 'pre-brief the hospitality kitchen on plant-based menu' })
            }
            if (/gluten/.test(notes)) {
              actions.push({ venue: 'event', action: 'confirm gluten-free substitutions in tea and lunch service' })
            }
            if (/halal|kosher|jain/.test(notes)) {
              actions.push({ venue: 'event', action: 'pre-brief hospitality kitchen on sourcing and prep' })
            }
            if (actions.length === 0) {
              actions.push({ venue: 'all', action: 'proceed with standard arrangements; offer personal liaison' })
            }
            return actions
          },
        ),
    ),
  ],
}
