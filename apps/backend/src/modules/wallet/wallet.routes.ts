import type { FastifyInstance } from 'fastify';
import { acceptTerms, requestTopup, getProviderTransactions } from './wallet.service.js';
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
          required: ['receiptPhotoUrl'],
          properties: {
            // Accepted from older apps but not used: the amount is what the artisan owes.
            amount: { type: 'number', minimum: 1, maximum: 100000, examples: [45] },
            receiptPhotoUrl: { type: 'string', maxLength: 500 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { receiptPhotoUrl } = request.body as { receiptPhotoUrl: string };
      return respond(reply, () => requestTopup(currentUser(request).userId, receiptPhotoUrl), {
        ok: 201,
        message: 'Top-up request submitted successfully. Awaiting admin verification.',
      });
    },
  );

  app.post(
    '/accept-terms',
    {
      schema: {
        tags: ['Wallet & Commissions'],
        summary: 'The artisan accepts the fees (the date and the fees are kept as proof)',
        security: [{ bearerAuth: [] }],
      },
      onRequest: [authenticate],
    },
    async (request, reply) => respond(reply, () => acceptTerms(currentUser(request).userId)),
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
