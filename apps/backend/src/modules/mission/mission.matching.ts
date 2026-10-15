import { db } from '../../config/db.js';
import { findNearbyProviderIds } from '../../services/redis.service.js';
import { MissionStatus } from '@el7al/shared';
import { calculateDistanceKm } from '../../utils/geo.js';
import { maxProviderDebt } from '../../config/business.js';
import { publish } from '../../events/domain-events.js';
import { logger } from '../../utils/logger.js';

export interface CreateMissionInput {
  clientId: string;
  categoryId: string;
  pickupLat: number;
  pickupLng: number;
  addressText: string;
  description?: string;
  radiusKm?: number;
  /** When set, only these artisans (provider profile ids) are offered the mission, if they are eligible. */
  selectedProviderIds?: string[];
}

const MAX_OFFER_RECIPIENTS = 20;

/** States in which a mission is under way (an artisan is assigned and the work is not finished). */
export const ONGOING_STATUSES = [
  MissionStatus.ACCEPTED,
  MissionStatus.EN_ROUTE,
  MissionStatus.ARRIVED,
  MissionStatus.IN_PROGRESS,
  MissionStatus.DUAL_CONFIRM,
];

/**
 * Available, active artisans of the category whose last known position is within range.
 * When nobody is nearby the result is empty: an offer is never broadcast to every artisan.
 */
export async function findCandidateProviders(
  categoryId: string,
  lat: number,
  lng: number,
  radiusKm: number,
  onlyProviderIds?: string[],
) {
  let nearbyProviderIds: string[] = [];
  try {
    nearbyProviderIds = await findNearbyProviderIds(lat, lng, radiusKm);
  } catch (err) {
    logger.warn({ err }, 'Redis nearby lookup warning');
  }
  if (onlyProviderIds && onlyProviderIds.length > 0) {
    nearbyProviderIds = nearbyProviderIds.filter((id) => onlyProviderIds.includes(id));
  }
  if (nearbyProviderIds.length === 0) return [];

  return db.providerProfile.findMany({
    where: {
      id: { in: nearbyProviderIds },
      isAvailable: true,
      // Artisans are only held back when an optional debt limit is configured (MAX_PROVIDER_DEBT_TND).
      ...(maxProviderDebt() > 0 ? { walletBalance: { gte: -maxProviderDebt() } } : {}),
      user: { status: 'ACTIVE' },
      categories: { some: { categoryId } },
      // Must NOT be actively engaged on an ongoing mission
      acceptedMissions: { none: { status: { in: ONGOING_STATUSES } } },
    },
    include: { user: true },
    orderBy: [{ ratingAverage: 'desc' }, { totalRatings: 'desc' }],
    take: MAX_OFFER_RECIPIENTS,
  });
}

/** Artisans a client could send a request to, with their distance, for the "choose who to ask" screen. */
export async function getCandidateProviders(categoryId: string, lat: number, lng: number, radiusKm = 25) {
  const providers = await findCandidateProviders(categoryId, lat, lng, radiusKm);
  const withProfile = await db.providerProfile.findMany({
    where: { id: { in: providers.map((p) => p.id) } },
    include: { categories: { include: { category: true } } },
  });
  const categoriesById = new Map(withProfile.map((p) => [p.id, p.categories.map((c) => c.category.name)]));

  return providers
    .filter((p) => p.currentLat != null && p.currentLng != null)
    .map((p) => ({
      providerId: p.id,
      userId: p.userId,
      fullName: p.user.fullName,
      avatarUrl: p.user.avatarUrl,
      bio: p.bio,
      ratingAverage: p.ratingAverage,
      totalRatings: p.totalRatings,
      distanceKm: calculateDistanceKm(lat, lng, p.currentLat as number, p.currentLng as number),
      specialities: categoriesById.get(p.id) ?? [],
    }));
}

/** Says that a request went out: the notification module offers it to each candidate and tells the client how many. */
export async function broadcastOffer(
  mission: {
    id: string;
    categoryId: string;
    addressText: string;
    description: string | null;
    commissionFee: unknown;
    pickupLat: number;
    pickupLng: number;
    createdAt: Date;
    category: { name: string };
  },
  clientProfile: { userId: string; user: { fullName: string; avatarUrl: string | null } },
  candidates: { userId: string }[],
) {
  await publish('mission.requested', {
    mission: {
      id: mission.id,
      categoryId: mission.categoryId,
      categoryName: mission.category.name,
      addressText: mission.addressText,
      description: mission.description,
      commissionFee: mission.commissionFee,
      pickupLat: mission.pickupLat,
      pickupLng: mission.pickupLng,
      createdAt: mission.createdAt,
    },
    client: {
      userId: clientProfile.userId,
      fullName: clientProfile.user.fullName,
      avatarUrl: clientProfile.user.avatarUrl,
    },
    candidateUserIds: candidates.map((c) => c.userId),
  });
}
