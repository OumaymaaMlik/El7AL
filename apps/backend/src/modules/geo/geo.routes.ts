import type { FastifyInstance } from 'fastify';
import { db } from '../../config/db.js';
import { updateProviderGeoLocation, removeProviderGeoLocation } from '../../services/redis.service.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { COMMISSION_DUE_MESSAGE } from '../../config/business.js';
import { isBlocked } from '../wallet/wallet.standing.js';
import { offerOpenMissionsTo } from '../mission/mission.lateOffers.js';

const TAG = 'Geospatial & Availability';
const SECURED = [{ bearerAuth: [] }];
const NO_PROFILE = { success: false, error: 'Provider profile not found' };

export async function geoRoutes(app: FastifyInstance) {
  // The one switch that makes an artisan receive offers. Going online needs a verified account and a position.
  app.put(
    '/provider/availability',
    {
      schema: {
        tags: [TAG],
        summary: 'Go online or offline',
        security: SECURED,
        body: {
          type: 'object',
          required: ['isAvailable'],
          properties: {
            isAvailable: { type: 'boolean' },
            currentLat: { type: 'number', minimum: -90, maximum: 90 },
            currentLng: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { isAvailable, currentLat, currentLng } = request.body as {
        isAvailable: boolean;
        currentLat?: number;
        currentLng?: number;
      };

      const profile = await db.providerProfile.findUnique({
        where: { userId: currentUser(request).userId },
        include: { user: { select: { status: true } } },
      });
      if (!profile) return reply.code(404).send(NO_PROFILE);

      // Going offline is always allowed; going online is for verified artisans only.
      if (isAvailable && profile.user.status !== 'ACTIVE') {
        return reply.code(403).send({
          success: false,
          code: 'ACCOUNT_NOT_VERIFIED',
          error: 'Votre compte doit être vérifié par El 7al avant de recevoir des demandes.',
        });
      }

      if (isAvailable && (await isBlocked(profile))) {
        return reply.code(403).send({ success: false, code: 'COMMISSION_DUE', error: COMMISSION_DUE_MESSAGE });
      }

      const updated = await db.providerProfile.update({
        where: { id: profile.id },
        data: {
          isAvailable,
          ...(currentLat !== undefined ? { currentLat } : {}),
          ...(currentLng !== undefined ? { currentLng } : {}),
        },
      });

      if (isAvailable && currentLat !== undefined && currentLng !== undefined) {
        await updateProviderGeoLocation(profile.id, currentLat, currentLng);
      } else if (!isAvailable) {
        await removeProviderGeoLocation(profile.id);
      }
      // A search may have started while the artisan was offline and still be running.
      if (isAvailable) await offerOpenMissionsTo(currentUser(request).userId);
      return reply.send({ success: true, data: updated });
    },
  );

  app.put(
    '/provider/location',
    {
      schema: {
        tags: [TAG],
        summary: 'Update the artisan GPS position',
        security: SECURED,
        body: {
          type: 'object',
          required: ['lat', 'lng'],
          properties: {
            lat: { type: 'number', minimum: -90, maximum: 90 },
            lng: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { lat, lng } = request.body as { lat: number; lng: number };
      const profile = await db.providerProfile.findUnique({ where: { userId: currentUser(request).userId } });
      if (!profile) return reply.code(404).send(NO_PROFILE);

      await db.providerProfile.update({ where: { id: profile.id }, data: { currentLat: lat, currentLng: lng } });
      if (profile.isAvailable) await updateProviderGeoLocation(profile.id, lat, lng);
      return reply.send({ success: true, message: 'Location updated successfully' });
    },
  );

  // What a client may see of an artisan: no e-mail, no phone number (the phone is shared once a job is accepted).
  app.get(
    '/providers/:id/profile',
    {
      schema: {
        tags: [TAG],
        summary: 'Public profile of an artisan: trades, rating, latest reviews',
        security: SECURED,
        params: { type: 'object', properties: { id: { type: 'string' } } },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const provider = await db.providerProfile.findFirst({
        where: { OR: [{ id }, { userId: id }] },
        select: {
          id: true,
          bio: true,
          radiusKm: true,
          ratingAverage: true,
          totalRatings: true,
          isAvailable: true,
          user: { select: { id: true, fullName: true, avatarUrl: true, status: true, createdAt: true } },
          categories: { include: { category: true } },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              client: { select: { user: { select: { fullName: true, avatarUrl: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
      if (!provider) return reply.code(404).send({ success: false, error: 'Provider not found.' });
      return reply.send({ success: true, data: provider });
    },
  );

  // Trades, presentation and zone. Availability has its own route because it needs the verified-account check.
  app.put(
    '/provider/settings',
    {
      schema: {
        tags: [TAG],
        summary: 'Update presentation and radius (the trade is chosen at sign-up and cannot be changed)',
        security: SECURED,
        body: {
          type: 'object',
          properties: {
            bio: { type: 'string', maxLength: 600 },
            radiusKm: { type: 'number', minimum: 1, maximum: 100 },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { bio, radiusKm } = request.body as { bio?: string; radiusKm?: number };
      const profile = await db.providerProfile.findUnique({ where: { userId: currentUser(request).userId } });
      if (!profile) return reply.code(404).send(NO_PROFILE);

      const updated = await db.providerProfile.update({
        where: { id: profile.id },
        data: { ...(bio !== undefined ? { bio } : {}), ...(radiusKm !== undefined ? { radiusKm } : {}) },
        include: { categories: { include: { category: true } } },
      });
      return reply.send({ success: true, data: updated });
    },
  );
}
