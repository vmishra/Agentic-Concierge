import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'
import { events, findEvent, searchEvents } from '@/data/events'

export const eventCatalogSkill: Skill = {
  name: 'event-catalog',
  description: 'Search the curated event catalog and pull structured event briefs.',
  instructions: `You have access to an event catalog. When a guest mentions a sport, destination, or window, call \`search_events\` first; then \`get_event\` for details. Never invent events.`,
  resources: [
    {
      label: 'categories in inventory',
      body: 'Formula 1, Tennis, Cricket, Football/Rugby, Golf, occasional marquee music events.',
    },
  ],
  tools: [
    defineLazyTool(
      {
        name: 'search_events',
        description: 'Return events matching a text query (sport, city, tag).',
        input: {
          type: 'object',
          properties: { query: { type: 'string', description: 'Free-text query.' } },
          required: ['query'],
        },
        owner: 'event-catalog',
        cost: 'low',
      },
      async () =>
        defineTool(
          {
            name: 'search_events',
            description: '',
            input: { type: 'object', properties: {} },
          },
          async (args: { query: string }) => {
            const hits = searchEvents(args.query)
            return hits.length > 0 ? hits : events.slice(0, 4)
          },
        ),
    ),
    defineLazyTool(
      {
        name: 'get_event',
        description: 'Fetch full detail for one event by id.',
        input: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
        owner: 'event-catalog',
        cost: 'low',
      },
      async () =>
        defineTool(
          {
            name: 'get_event',
            description: '',
            input: { type: 'object', properties: {} },
          },
          async (args: { id: string }) => findEvent(args.id) ?? null,
        ),
    ),
  ],
}
