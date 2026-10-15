import { db } from '../../config/db.js';
import { acquireMissionLock } from '../../services/redis.service.js';
import { scheduleMissionTimeout } from '../../queues/mission.queue.js';
import { MissionStatus } from '@el7al/shared';
import { COMMISSION_FEE_TND, maxProviderDebt } from '../../config/business.js';
import { publish } from '../../events/domain-events.js';
import {
  ONGOING_STATUSES,
  broadcastOffer,
  findCandidateProviders,
  type CreateMissionInput,
} from './mission.matching.js';
import { logger } from '../../utils/logger.js';

/** An offer nobody accepts is closed after a minute (the queue worker cancels it and tells the client). */
async function scheduleOfferExpiry(missionId: string) {
  try {
    await scheduleMissionTimeout(missionId, 60000);
  } catch (e) {
    logger.warn({ err: e }, 'Could not schedule the offer expiry');
  }
}

export async function requestMission(input: CreateMissionInput) {
  const clientProfile = await db.clientProfile.findUnique({
    where: { userId: input.clientId },
    include: { user: true },
  });

  if (!clientProfile) {
    throw new Error('Client profile not found');
  }

  // 1a. Block multiple active searches/missions
  const activeMission = await db.mission.findFirst({
    where: {
      clientId: clientProfile.id,
      status: {
        in: [MissionStatus.BROADCASTED, ...ONGOING_STATUSES],
      },
    },
  });

  if (activeMission) {
    throw new Error('Vous avez déjà une recherche en cours ou une mission active.');
  }

  // 1. Create Mission record in DB
  const mission = await db.mission.create({
    data: {
      clientId: clientProfile.id,
      categoryId: input.categoryId,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      addressText: input.addressText,
      description: input.description || null,
      status: MissionStatus.BROADCASTED,
      commissionFee: COMMISSION_FEE_TND,
    },
    include: {
      category: true,
      client: {
        include: { user: true },
      },
    },
  });

  // 2-3. Find the artisans in range and send them the offer in real time.
  const candidateProviders = await findCandidateProviders(
    input.categoryId,
    input.pickupLat,
    input.pickupLng,
    input.radiusKm || 25,
    input.selectedProviderIds,
  );
  await broadcastOffer(mission, clientProfile, candidateProviders);

  await scheduleOfferExpiry(mission.id);

  return {
    mission,
    notifiedProviderCount: candidateProviders.length,
    candidateProviderIds: candidateProviders.map((p) => p.id),
  };
}

export async function relaunchMission(missionId: string, clientId: string) {
  const clientProfile = await db.clientProfile.findUnique({
    where: { userId: clientId },
  });

  if (!clientProfile) {
    throw new Error('Client profile not found');
  }

  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: { category: true, client: { include: { user: true } } },
  });

  if (!mission || mission.clientId !== clientProfile.id) {
    throw new Error('Mission not found or unauthorized');
  }
  // Only a search that ended without an artisan can be started again; a job under way must not be reset.
  const relaunchable: MissionStatus[] = [MissionStatus.CREATED, MissionStatus.BROADCASTED, MissionStatus.CANCELLED];
  if (!relaunchable.includes(mission.status as MissionStatus) || mission.providerId) {
    throw new Error('Cette demande ne peut plus être relancée.');
  }

  const updatedMission = await db.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.BROADCASTED,
      providerId: null,
      cancellationReason: null,
    },
    include: { category: true, client: { include: { user: true } } },
  });

  // Re-broadcast to the artisans currently in range.
  const candidates = await findCandidateProviders(
    updatedMission.categoryId,
    updatedMission.pickupLat,
    updatedMission.pickupLng,
    25,
  );
  await broadcastOffer(updatedMission, updatedMission.client, candidates);
  await scheduleOfferExpiry(updatedMission.id);

  return updatedMission;
}

export async function acceptMission(missionId: string, providerUserId: string) {
  const providerProfile = await db.providerProfile.findUnique({
    where: { userId: providerUserId },
    include: { user: true },
  });

  if (!providerProfile) {
    throw new Error('Provider profile not found');
  }

  if (providerProfile.user.status !== 'ACTIVE') {
    throw new Error('Votre compte doit être vérifié par El 7al avant de recevoir des demandes.');
  }

  if (maxProviderDebt() > 0 && Number(providerProfile.walletBalance) < -maxProviderDebt()) {
    throw new Error('Votre solde de commissions dépasse la limite autorisée. Contactez El 7al pour le régulariser.');
  }

  // 1. Acquire Redis Atomic Lock (Redlock algorithm) to guarantee first-to-accept pairing
  const lockAcquired = await acquireMissionLock(missionId, providerProfile.id);
  if (!lockAcquired) {
    throw new Error('Mission déjà acceptée par un autre prestataire.');
  }

  // 2. Verify mission is still broadcasted in DB
  const mission = await db.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission || (mission.status !== MissionStatus.CREATED && mission.status !== MissionStatus.BROADCASTED)) {
    throw new Error("Cette offre n'est plus disponible.");
  }

  // 3. Assign mission to provider
  const updatedMission = await db.mission.update({
    where: { id: missionId },
    data: {
      providerId: providerProfile.id,
      status: MissionStatus.ACCEPTED,
      startedAt: new Date(),
    },
    include: {
      client: { include: { user: true } },
      provider: { include: { user: true } },
      category: true,
    },
  });

  // 4. Tell the platform (pairing events and notifications are the notification module's job)
  await publish('mission.accepted', {
    missionId,
    clientUserId: updatedMission.client.userId,
    clientName: updatedMission.client.user.fullName,
    provider: {
      id: providerProfile.id,
      userId: providerProfile.userId,
      fullName: providerProfile.user.fullName,
      phoneNumber: providerProfile.user.phoneNumber,
      avatarUrl: providerProfile.user.avatarUrl,
      ratingAverage: providerProfile.ratingAverage,
    },
  });

  return updatedMission;
}

export async function cancelMission(missionId: string, userId: string, reason: string) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: {
      provider: { include: { user: true } },
      client: { include: { user: true } },
    },
  });

  if (!mission) {
    throw new Error('Mission not found');
  }

  const isClient = mission.client?.userId === userId;
  const isProvider = mission.provider?.userId === userId;
  if (!isClient && !isProvider) {
    throw new Error('Only a participant of this mission can cancel it.');
  }
  if (mission.status === MissionStatus.CANCELLED) return mission;
  if (mission.status === MissionStatus.COMPLETED) {
    throw new Error('Cette mission est déjà terminée.');
  }

  const wasAccepted = (ONGOING_STATUSES as MissionStatus[]).includes(mission.status as MissionStatus);

  const updatedMission = await db.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.CANCELLED,
      cancellationReason: reason,
      cancelledByRole: isClient ? 'CLIENT' : 'PROVIDER',
    },
    include: {
      provider: { include: { user: true } },
      client: { include: { user: true } },
    },
  });

  await publish('mission.cancelled', {
    mission: {
      id: missionId,
      clientUserId: updatedMission.client?.user?.id,
      providerUserId: updatedMission.provider?.user?.id,
    },
    reason,
    wasAccepted,
    cancelledBy: isClient ? 'CLIENT' : 'PROVIDER',
  });

  return updatedMission;
}
