import type { FastifyInstance } from 'fastify';
import { requestTopup, getProviderTransactions } from './wallet.service.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { respond } from '../../utils/respond.js';

export async function walletRoutes(app: FastifyInstance) {
  app.post(
    '/topup',
    {
      schema: {
        tags: ['Wallet & Commissions'],
        summary: 'Artisan submits a bank-transfer top-up with the receipt photo',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['amount', 'receiptPhotoUrl'],
          properties: {
            amount: { type: 'number', minimum: 1, maximum: 100000, examples: [100] },
            receiptPhotoUrl: { type: 'string', maxLength: 500 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { amount, receiptPhotoUrl } = request.body as { amount: number; receiptPhotoUrl: string };
      return respond(reply, () => requestTopup(currentUser(request).userId, amount, receiptPhotoUrl), {
        ok: 201,
        message: 'Top-up request submitted successfully. Awaiting admin verification.',
      });
    },
  );

  app.get(
    '/transactions',
    {
      schema: {
        tags: ['Wallet & Commissions'],
        summary: 'Wallet balance and top-up history of the artisan',
        security: [{ bearerAuth: [] }],
      },
      onRequest: [authenticate],
    },
    async (request, reply) => respond(reply, () => getProviderTransactions(currentUser(request).userId)),
  );
}
