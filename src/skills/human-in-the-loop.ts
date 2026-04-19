import { defineLazyTool, defineTool } from '@/adk/tool'
import type { Skill } from '@/adk/skill'
import { hitlBus } from '@/adk/hitl'

/**
 * human-in-the-loop skill — turns human confirmation into a proper tool call.
 *
 * When `request_approval` is invoked, it registers a request id on the
 * HitlBus and awaits resolution. The UI has emitted an approval_request
 * A2UI artifact with the same requestId and interactive Approve/Deny
 * controls; clicking either resolves the promise and the agent resumes.
 */
export const humanInTheLoopSkill: Skill = {
  name: 'human-in-the-loop',
  description: 'Pause the agent turn and wait for a human decision mid-run.',
  instructions: `When a decision is consequential (a booking, an upgrade, a confirmation), call \`request_approval\` to pause and collect the user's explicit decision before proceeding. The agent turn pauses until the human responds.`,
  tools: [
    defineLazyTool(
      {
        name: 'request_approval',
        description:
          'Pause the turn and wait for a human Approve/Deny decision on a specific action. Returns { approved: boolean }.',
        input: {
          type: 'object',
          properties: {
            requestId: { type: 'string', description: 'Client-provided id matching the UI artifact.' },
            title: { type: 'string' },
            body: { type: 'string' },
          },
          required: ['requestId'],
        },
        owner: 'human-in-the-loop',
        cost: 'low',
      },
      async () =>
        defineTool(
          { name: 'request_approval', description: '', input: { type: 'object', properties: {} } },
          async (args: { requestId: string; title?: string; body?: string }, ctx) => {
            // Wait on the HITL bus, honouring abort.
            const abort = new Promise<never>((_, reject) => {
              if (!ctx.signal) return
              if (ctx.signal.aborted) reject(new Error('aborted'))
              ctx.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
            })
            const decision = await Promise.race([hitlBus.await(args.requestId), abort])
            if (decision.kind !== 'approval') {
              return { approved: false, note: 'unexpected decision shape' }
            }
            return { approved: decision.approved, note: decision.note }
          },
        ),
    ),
  ],
}
