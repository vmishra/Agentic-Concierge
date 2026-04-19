import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'
import { hotels, hotelsIn } from '@/data/hotels'
import { flights } from '@/data/flights'

export const travelLogisticsSkill: Skill = {
  name: 'travel-logistics',
  description: 'Hotels, flights, and transfers near an event venue.',
  instructions: `Use \`hotels_near_event\` to find accommodation; \`find_flights\` for flights between airports. Always report the distance to the venue in km and flag accessibility when relevant.`,
  tools: [
    defineLazyTool(
      {
        name: 'hotels_near_event',
        description: 'Hotels in an event city with distance to venue and nightly rates.',
        input: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            maxDistanceKm: { type: 'number' },
            accessibility: { type: 'boolean' },
          },
          required: ['city'],
        },
        owner: 'travel-logistics',
        cost: 'low',
      },
      async () =>
        defineTool(
          { name: 'hotels_near_event', description: '', input: { type: 'object', properties: {} } },
          async (args: { city: string; maxDistanceKm?: number; accessibility?: boolean }) => {
            let list = hotelsIn(args.city)
            if (args.maxDistanceKm) list = list.filter((h) => h.distanceToVenueKm <= args.maxDistanceKm!)
            if (args.accessibility) list = list.filter((h) => h.accessibility)
            return list
          },
        ),
    ),
    defineLazyTool(
      {
        name: 'find_flights',
        description: 'Return candidate flights between two airports.',
        input: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
          },
          required: ['from', 'to'],
        },
        owner: 'travel-logistics',
        cost: 'low',
      },
      async () =>
        defineTool(
          { name: 'find_flights', description: '', input: { type: 'object', properties: {} } },
          async (args: { from: string; to: string }) =>
            flights.filter((f) => f.from === args.from && f.to === args.to),
        ),
    ),
    defineLazyTool(
      {
        name: 'hotel_detail',
        description: 'Fetch a single hotel by id.',
        input: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        owner: 'travel-logistics',
      },
      async () =>
        defineTool(
          { name: 'hotel_detail', description: '', input: { type: 'object', properties: {} } },
          async (args: { id: string }) => hotels.find((h) => h.id === args.id) ?? null,
        ),
    ),
  ],
}
