import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'

export const giftingNarrativeSkill: Skill = {
  name: 'gifting-narrative',
  description: 'Craft a short, understated gifting narrative around a curated package.',
  instructions: `When the trip is for a gift — an executive milestone, a board thank-you, a family anniversary — call \`narrative_for\` to draft two or three elegant lines. Do not be cute. Do not use exclamation marks.`,
  tools: [
    defineLazyTool(
      {
        name: 'narrative_for',
        description: 'Draft a 2–3 sentence gifting narrative in understated copy.',
        input: {
          type: 'object',
          properties: {
            occasion: { type: 'string' },
            tone: {
              type: 'string',
              enum: ['corporate', 'family', 'personal'],
            },
            highlights: { type: 'string' },
          },
          required: ['occasion', 'tone'],
        },
        owner: 'gifting-narrative',
      },
      async () =>
        defineTool(
          { name: 'narrative_for', description: '', input: { type: 'object', properties: {} } },
          async (args: { occasion: string; tone: 'corporate' | 'family' | 'personal'; highlights?: string }) => {
            const lead =
              args.tone === 'corporate'
                ? 'A weekend arranged without edges.'
                : args.tone === 'family'
                  ? 'An unhurried weekend, meant to be shared.'
                  : 'A quiet marker for a personal milestone.'
            const detail = args.highlights
              ? `The centrepiece is ${args.highlights}; the rest is built around it.`
              : 'Every arrangement is made with the occasion in mind.'
            return {
              lines: [lead, detail, 'Nothing announced; everything considered.'],
            }
          },
        ),
    ),
  ],
}
