import type { FastifyInstance } from 'fastify';
import { createDispute } from './dispute.service.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { respond } from '../../utils/respond.js';

export async function disputeRoutes(app: FastifyInstance) {
  app.post(
    '/disputes',
    {
      schema: {
        tags: ['Reviews & Disputes'],
        summary: 'Report a problem about an intervention',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['missionId', 'reason'],
          properties: {
            missionId: { type: 'string' },
            reason: { type: 'string', minLength: 5, maxLength: 1000, examples: ['The artisan arrived 2 hours late.'] },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { missionId, reason } = request.body as { missionId: string; reason: string };
      return respond(reply, () => createDispute(missionId, currentUser(request).userId, reason), {
        ok: 201,
        message: 'Dispute report submitted. Administration will review.',
      });
    },
  );
}
