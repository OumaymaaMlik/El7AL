import type { FastifyInstance, FastifyRequest } from 'fastify';
import { requestMission, acceptMission, cancelMission, relaunchMission } from './mission.service.js';
import { getCandidateProviders } from './mission.matching.js';
import { getMissionHistory, getMissionTotals, getMissionForUser } from './mission.queries.js';
import { startRouteMission, arrivedAtMission, startWorkMission, dualConfirmMission } from './mission.progress.js';
import { submitMissionReview } from './mission.review.js';
import { markMessagesRead } from './mission.chat.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { respond } from '../../utils/respond.js';

const ID_PARAMS = { type: 'object', properties: { id: { type: 'string' } } } as const;
const SECURED = [{ bearerAuth: [] }];

const missionId = (request: FastifyRequest) => (request.params as { id: string }).id;

/** The steps of a job, each one a button for the artisan: same shape, only the service call differs. */
const ARTISAN_STEPS = [
  { path: 'start-route', run: startRouteMission, summary: 'Artisan starts the trip (the client is told "on the way")' },
  { path: 'arrived', run: arrivedAtMission, summary: 'Artisan arrives at the client (the client is told "arrived")' },
  { path: 'start-work', run: startWorkMission, summary: 'Artisan starts work (IN_PROGRESS, the timer starts)' },
] as const;

export async function missionRoutes(app: FastifyInstance) {
  app.get(
    '/candidates',
    {
      schema: {
        tags: ['Missions'],
        summary: 'List available artisans near a point for a category',
        security: SECURED,
        querystring: {
          type: 'object',
          required: ['categoryId', 'pickupLat', 'pickupLng'],
          properties: {
            categoryId: { type: 'string' },
            pickupLat: { type: 'number', minimum: -90, maximum: 90 },
            pickupLng: { type: 'number', minimum: -180, maximum: 180 },
            radiusKm: { type: 'number', minimum: 1, maximum: 100 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const q = request.query as { categoryId: string; pickupLat: number; pickupLng: number; radiusKm?: number };
      return reply.send({
        success: true,
        data: await getCandidateProviders(q.categoryId, q.pickupLat, q.pickupLng, q.radiusKm ?? 25),
      });
    },
  );

  app.post(
    '/request',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Client creates a new service request and broadcasts to nearby providers',
        security: SECURED,
        body: {
          type: 'object',
          required: ['categoryId', 'pickupLat', 'pickupLng', 'addressText'],
          properties: {
            categoryId: { type: 'string', examples: ['cat-id-plumbing'] },
            pickupLat: { type: 'number', minimum: -90, maximum: 90, examples: [36.8065] },
            pickupLng: { type: 'number', minimum: -180, maximum: 180, examples: [10.1815] },
            addressText: { type: 'string', minLength: 2, maxLength: 300, examples: ['Tunis, Avenue Habib Bourguiba'] },
            description: { type: 'string', maxLength: 1000, examples: ["Fuite d'eau sous l'évier de la cuisine"] },
            radiusKm: { type: 'number', minimum: 1, maximum: 100, examples: [15] },
            selectedProviderIds: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const body = request.body as Omit<Parameters<typeof requestMission>[0], 'clientId'>;
      return respond(reply, () => requestMission({ ...body, clientId: currentUser(request).userId }), { ok: 201 });
    },
  );

  app.post(
    '/:id/relaunch',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Relaunch an unaccepted request to nearby providers',
        security: SECURED,
        params: ID_PARAMS,
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      respond(reply, () => relaunchMission(missionId(request), currentUser(request).userId), {
        message: 'Mission demand re-broadcasted successfully.',
      }),
  );

  // Two artisans can press "accept" together: a Redis lock lets one win, the other gets 409.
  app.post(
    '/:id/accept',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Artisan accepts a job offer (safe against races)',
        security: SECURED,
        params: ID_PARAMS,
      },
      onRequest: [authenticate],
    },
    async (request, reply) =>
      respond(reply, () => acceptMission(missionId(request), currentUser(request).userId), {
        fail: 409,
        message: 'Mission assigned successfully.',
      }),
  );

  for (const step of ARTISAN_STEPS) {
    app.post(
      `/:id/${step.path}`,
      {
        schema: { tags: ['Missions'], summary: step.summary, security: SECURED, params: ID_PARAMS },
        onRequest: [authenticate],
      },
      async (request, reply) => respond(reply, () => step.run(missionId(request), currentUser(request).userId)),
    );
  }

  app.post(
    '/:id/dual-confirm',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Completion confirmation (artisan, then client)',
        security: SECURED,
        params: ID_PARAMS,
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const user = currentUser(request);
      return respond(reply, () => dualConfirmMission(missionId(request), user.userId, user.role));
    },
  );

  app.post(
    '/:id/review',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Client submits rating & review after completion',
        security: SECURED,
        params: ID_PARAMS,
        body: {
          type: 'object',
          required: ['rating'],
          properties: {
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string', maxLength: 1000 },
            amount: { type: 'string' },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { rating, comment, amount } = request.body as { rating: number; comment?: string; amount?: string };
      return respond(reply, () =>
        submitMissionReview(missionId(request), currentUser(request).userId, rating, comment, amount),
      );
    },
  );

  app.post(
    '/:id/cancel',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Cancel mission with reason',
        security: SECURED,
        params: ID_PARAMS,
        body: {
          type: 'object',
          required: ['reason'],
          properties: { reason: { type: 'string', examples: ['Client no longer available'] } },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { reason } = request.body as { reason: string };
      return respond(reply, () => cancelMission(missionId(request), currentUser(request).userId, reason));
    },
  );

  app.get(
    '/history',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Fetch past and ongoing missions for authenticated user',
        security: SECURED,
        querystring: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            cursor: { type: 'string' },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const user = currentUser(request);
      const { role, limit, cursor } = request.query as { role?: string; limit?: number; cursor?: string };
      const viewAs = role || user.role;
      const [history, totals] = await Promise.all([
        getMissionHistory(user.userId, viewAs, { limit, cursor }),
        getMissionTotals(user.userId, viewAs),
      ]);
      return reply.send({ success: true, data: history, meta: totals });
    },
  );

  app.get(
    '/:id',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Fetch single mission details by ID',
        security: SECURED,
        params: ID_PARAMS,
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const user = currentUser(request);
      const mission = await getMissionForUser(missionId(request), user.userId, user.role);
      if (!mission) return reply.code(404).send({ success: false, error: 'Mission not found' });
      return reply.send({ success: true, data: mission });
    },
  );

  app.post(
    '/:id/read',
    {
      schema: {
        tags: ['Missions'],
        summary: 'Mark all incoming messages in a mission as read',
        security: SECURED,
        params: ID_PARAMS,
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const user = currentUser(request);
      const found = await markMessagesRead(missionId(request), user.userId, user.role);
      if (!found) return reply.code(404).send({ success: false, error: 'Mission not found' });
      return reply.send({ success: true });
    },
  );
}
