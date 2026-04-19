import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'
import { hospitality, hospitalityForEvent } from '@/data/hospitality'

export const hospitalityTiersSkill: Skill = {
  name: 'hospitality-tiers',
  description: 'Know what each hospitality tier actually includes — paddock, debenture, pavilion, suites.',
  instructions: `Explain hospitality tiers in human terms: what the guest will see, taste, and experience. Use \`tiers_for_event\` to list; use \`tier_detail\` to explain one. Never recommend a tier without saying what's included.`,
  tools: [
    defineLazyTool(
      {
        name: 'tiers_for_event',
        description: 'List hospitality tiers available for an event, with per-person pricing.',
        input: {
          type: 'object',
          properties: { eventId: { type: 'string' } },
          required: ['eventId'],
        },
        owner: 'hospitality-tiers',
        cost: 'low',
      },
      async () =>
        defineTool(
          { name: 'tiers_for_event', description: '', input: { type: 'object', properties: {} } },
          async (args: { eventId: string }) => hospitalityForEvent(args.eventId),
        ),
    ),
    defineLazyTool(
      {
        name: 'tier_detail',
        description: 'Return the full inclusions and insider note for one hospitality tier.',
        input: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        owner: 'hospitality-tiers',
        cost: 'low',
      },
      async () =>
        defineTool(
          { name: 'tier_detail', description: '', input: { type: 'object', properties: {} } },
          async (args: { id: string }) => hospitality.find((h) => h.id === args.id) ?? null,
        ),
    ),
  ],
}
