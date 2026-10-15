import type { FastifyInstance, FastifyRequest } from 'fastify';
import { AccountStatus } from '@el7al/shared';
import { requireAdmin, currentUser } from '../../utils/authGuards.js';
import { respond } from '../../utils/respond.js';
import { getAllUsers, updateUserStatus, getPendingProviders, verifyProvider } from './admin.users.service.js';
import { deleteAccountAsAdmin } from '../user/accountDeletion.js';
import { getAllMissions, getUserMissions, getPlatformStats } from './admin.activity.service.js';
import { getCategories, createCategory, updateCategory, deleteCategory } from './admin.catalog.service.js';
import { getPendingTopups, approveTopup, rejectTopup, getDisputes, resolveDispute } from './admin.finance.service.js';

const idOf = (request: FastifyRequest) => (request.params as { id: string }).id;
const ID_PARAMS = { type: 'object', properties: { id: { type: 'string' } } } as const;
const CATEGORY_FIELDS = {
  name: { type: 'string', minLength: 2, maxLength: 60 },
  icon: { type: 'string', maxLength: 40 },
  description: { type: 'string', maxLength: 200 },
} as const;

/** The options every admin route shares: documented under one tag, behind the admin guard. */
const admin = (summary: string, extra: Record<string, unknown> = {}) => ({
  schema: { tags: ['Admin & Supervision'], summary, security: [{ bearerAuth: [] }], ...extra },
  onRequest: [requireAdmin],
});

export async function adminRoutes(app: FastifyInstance) {
  // ---- People
  app.get('/users', admin('List users with search, role and status filters'), async (request, reply) => {
    const { query, role, status } = request.query as { query?: string; role?: string; status?: string };
    return respond(reply, () => getAllUsers(query, role, status));
  });

  app.get('/users/:id/missions', admin('Interventions of one account', { params: ID_PARAMS }), async (request, reply) =>
    respond(reply, () => getUserMissions(idOf(request))),
  );

  app.put(
    '/users/:id/status',
    admin('Block or reactivate an account', {
      params: ID_PARAMS,
      body: {
        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string', enum: Object.values(AccountStatus) } },
      },
    }),
    async (request, reply) => {
      const { status } = request.body as { status: AccountStatus };
      return respond(reply, () => updateUserStatus(idOf(request), status));
    },
  );

  app.delete('/users/:id', admin('Delete an account', { params: ID_PARAMS }), async (request, reply) =>
    respond(reply, async () => {
      await deleteAccountAsAdmin(idOf(request));
      return { deleted: true };
    }),
  );

  // ---- Artisan verification
  app.get('/providers/pending', admin('Artisans waiting for an identity check'), async (_request, reply) =>
    respond(reply, getPendingProviders),
  );

  app.put(
    '/providers/:id/verify',
    admin('Approve an artisan, or refuse with a reason the artisan will see', {
      params: ID_PARAMS,
      body: {
        type: 'object',
        required: ['approve'],
        properties: { approve: { type: 'boolean' }, notes: { type: 'string', maxLength: 500 } },
      },
    }),
    async (request, reply) => {
      const { approve, notes } = request.body as { approve: boolean; notes?: string };
      return respond(reply, () => verifyProvider(idOf(request), approve, notes));
    },
  );

  // ---- Interventions and figures
  app.get('/missions', admin('All interventions with their duration'), async (request, reply) =>
    respond(reply, () => getAllMissions((request.query as { status?: string }).status)),
  );
  app.get('/stats', admin('Figures of the admin home'), async (_request, reply) => respond(reply, getPlatformStats));

  // ---- Trades
  app.get('/categories', admin('List trades'), async (_request, reply) => respond(reply, getCategories));

  app.post(
    '/categories',
    admin('Create a trade', { body: { type: 'object', required: ['name'], properties: CATEGORY_FIELDS } }),
    async (request, reply) => respond(reply, () => createCategory(request.body as { name: string })),
  );

  app.put(
    '/categories/:id',
    admin('Update a trade', {
      params: ID_PARAMS,
      body: { type: 'object', properties: { ...CATEGORY_FIELDS, isActive: { type: 'boolean' } } },
    }),
    async (request, reply) => respond(reply, () => updateCategory(idOf(request), request.body as { name?: string })),
  );

  app.delete('/categories/:id', admin('Delete a trade', { params: ID_PARAMS }), async (request, reply) =>
    respond(reply, async () => {
      await deleteCategory(idOf(request));
      return { deleted: true };
    }),
  );

  // ---- Bank transfers
  app.get('/topups/pending', admin('Bank transfers waiting for validation'), async (_request, reply) =>
    respond(reply, getPendingTopups),
  );

  app.post(
    '/topups/:id/approve',
    admin('Validate a transfer and credit the wallet', { params: ID_PARAMS }),
    async (request, reply) =>
      respond(reply, () => approveTopup(idOf(request), currentUser(request).userId), { message: 'Top-up approved.' }),
  );

  app.post('/topups/:id/reject', admin('Reject a transfer', { params: ID_PARAMS }), async (request, reply) =>
    respond(reply, () => rejectTopup(idOf(request), currentUser(request).userId), { message: 'Top-up rejected.' }),
  );

  // ---- Disputes
  app.get('/disputes', admin('Disputes and reports'), async (_request, reply) => respond(reply, getDisputes));

  app.put(
    '/disputes/:id',
    admin('Resolve or dismiss a dispute', {
      params: ID_PARAMS,
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['RESOLVED', 'DISMISSED'] },
          resolutionNotes: { type: 'string', maxLength: 500 },
        },
      },
    }),
    async (request, reply) => {
      const { status, resolutionNotes } = request.body as {
        status: 'RESOLVED' | 'DISMISSED';
        resolutionNotes?: string;
      };
      return respond(reply, () => resolveDispute(idOf(request), status, resolutionNotes));
    },
  );
}
