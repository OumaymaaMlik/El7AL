import { db } from '../../config/db.js';
import { redis } from '../../services/redis.service.js';
import { MissionStatus } from '@el7al/shared';
import { publish } from '../../events/domain-events.js';
import { calculateDistanceKm } from '../../utils/geo.js';
import { logger } from '../../utils/logger.js';
import { isBlocked } from '../wallet/wallet.standing.js';
import { COMMISSION_FEE_TND } from '../../config/business.js';
import { ONGOING_STATUSES } from './mission.matching.js';

/** The same reach as a new request. */
const OFFER_RADIUS_KM = 25;
const REMEMBER_SECONDS = 15 * 60;

const offeredKey = (missionId: string) => `mission:offered:${missionId}`;
const declinedKey = (missionId: string) => `mission:declined:${missionId}`;
const chosenKey = (missionId: string) => `mission:chosen:${missionId}`;

async function remember(key: string, providerUserId: string) {
  await redis.sadd(key, providerUserId);
  await redis.expire(key, REMEMBER_SECONDS);
}

export async function rememberOffered(missionId: string, providerUserIds: string[]) {
  try {
    for (const userId of providerUserIds) await remember(offeredKey(missionId), userId);
  } catch (err) {
    logger.warn({ err }, 'Could not remember who was offered a mission');
  }
}

/** A request limited to some artisans must stay limited to them when others come online. */
export async function rememberChosen(missionId: string, providerIds: string[]) {
  for (const providerId of providerIds) await remember(chosenKey(missionId), providerId);
}

/** A relaunched search goes to every artisan in range. */
export async function forgetChosen(missionId: string) {
  await redis.del(chosenKey(missionId));
}

async function isLeftOut(missionId: string, providerId: string) {
  const chosen = await redis.smembers(chosenKey(missionId));
  return chosen.length > 0 && !chosen.includes(providerId);
}

/** An artisan who refused a request is not shown it again. */
export async function rememberDeclined(missionId: string, providerUserId: string) {
  try {
    await remember(declinedKey(missionId), providerUserId);
  } catch (err) {
    logger.warn({ err }, 'Could not remember a refused offer');
  }
}

/** The artisan, if they can receive a request right now. */
async function availableArtisan(providerUserId: string) {
  const profile = await db.providerProfile.findUnique({
    where: { userId: providerUserId },
    include: {
      user: { select: { status: true } },
      categories: { select: { categoryId: true } },
      acceptedMissions: { where: { status: { in: ONGOING_STATUSES } }, select: { id: true } },
    },
  });
  if (!profile || !profile.isAvailable || profile.user.status !== 'ACTIVE') return null;
  if (profile.acceptedMissions.length > 0 || profile.currentLat === null || profile.currentLng === null) return null;
  return (await isBlocked(profile)) ? null : profile;
}

/**
 * Requests still searching when an artisan becomes reachable (goes online, or reopens the app): each one of their
 * trade and close enough is offered to them. The client is told once that another artisan was found.
 */
export async function offerOpenMissionsTo(providerUserId: string): Promise<void> {
  try {
    const profile = await availableArtisan(providerUserId);
    if (!profile) return;
    const open = await db.mission.findMany({
      where: {
        status: MissionStatus.BROADCASTED,
        providerId: null,
        categoryId: { in: profile.categories.map((c) => c.categoryId) },
      },
      include: { category: true, client: { include: { user: true } } },
      orderBy: { updatedAt: 'asc' },
      take: 10,
    });
    for (const mission of open) {
      const distance = calculateDistanceKm(
        profile.currentLat as number,
        profile.currentLng as number,
        mission.pickupLat,
        mission.pickupLng,
      );
      if (distance > OFFER_RADIUS_KM) continue;
      if (await redis.sismember(declinedKey(mission.id), providerUserId)) continue;
      if (await isLeftOut(mission.id, profile.id)) continue;
      const firstTime = !(await redis.sismember(offeredKey(mission.id), providerUserId));
      await rememberOffered(mission.id, [providerUserId]);
      await publish('mission.offeredLate', {
        mission: {
          id: mission.id,
          categoryId: mission.categoryId,
          categoryName: mission.category?.name || 'Intervention',
          addressText: mission.addressText,
          description: mission.description,
          commissionFee: Number(mission.commissionFee) || COMMISSION_FEE_TND,
          pickupLat: mission.pickupLat,
          pickupLng: mission.pickupLng,
          createdAt: mission.createdAt,
        },
        client: {
          userId: mission.client.userId,
          fullName: mission.client.user.fullName,
          avatarUrl: mission.client.user.avatarUrl,
        },
        providerUserId,
        firstTime,
      });
    }
  } catch (err) {
    logger.warn({ err }, 'Could not send open requests to an artisan');
  }
}
