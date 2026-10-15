import type { Prisma } from '@prisma/client';
import { db } from '../../config/db.js';
import { MissionStatus } from '@el7al/shared';
import { calculateDistanceKm, calculateEtaMinutes } from '../../utils/geo.js';
import { COMMISSION_FEE_TND } from '../../config/business.js';
import { publish } from '../../events/domain-events.js';

type MissionWithUsers = NonNullable<Awaited<ReturnType<typeof loadMission>>>;

function loadMission(missionId: string) {
  return db.mission.findUnique({
    where: { id: missionId },
    include: { client: { include: { user: true } }, provider: { include: { user: true } } },
  });
}

/**
 * Moves a mission one step forward, safely:
 * - only the named participant (the assigned artisan, or the mission's client) may do it;
 * - only from the allowed states, enforced in the UPDATE itself so two taps or two devices cannot both win;
 * - repeating a step that already happened is a harmless no-op (`changed: false`).
 */
async function advance(
  missionId: string,
  userId: string,
  actor: 'PROVIDER' | 'CLIENT',
  from: MissionStatus[],
  to: MissionStatus,
  extra: { startedAt?: Date; completedAt?: Date } = {},
  /** Runs in the same transaction as the status change, so both happen or neither does. */
  after?: (tx: Prisma.TransactionClient, mission: MissionWithUsers) => Promise<void>,
): Promise<{ mission: MissionWithUsers; changed: boolean }> {
  const mission = await loadMission(missionId);
  if (!mission) throw new Error('Mission not found');

  const allowedUserId = actor === 'PROVIDER' ? mission.provider?.userId : mission.client?.userId;
  if (!allowedUserId || allowedUserId !== userId) {
    throw new Error(
      actor === 'PROVIDER' ? 'Only the assigned artisan can do this.' : 'Only the client of this mission can do this.',
    );
  }
  if (mission.status === to) return { mission, changed: false };

  const moved = await db.$transaction(async (tx) => {
    const result = await tx.mission.updateMany({
      where: { id: missionId, status: { in: from } },
      data: { status: to, ...extra },
    });
    if (result.count === 0) return false;
    if (after) await after(tx, mission);
    return true;
  });
  if (!moved) throw new Error(`Cette étape n'est pas possible quand la mission est « ${mission.status} ».`);

  return { mission: (await loadMission(missionId)) as MissionWithUsers, changed: true };
}

/** Sends a status update (and optional chat line) to the mission room and both participants. */
async function announce(
  mission: MissionWithUsers,
  event: 'mission:status_update' | 'mission:completed',
  payload: Record<string, unknown>,
  chat?: { senderId: string; content: string },
) {
  const message = chat
    ? await db.chatMessage.create({ data: { missionId: mission.id, senderId: chat.senderId, content: chat.content } })
    : undefined;
  await publish('mission.progressed', {
    event,
    mission: {
      id: mission.id,
      clientUserId: mission.client?.user?.id,
      providerUserId: mission.provider?.user?.id,
      providerName: mission.provider?.user?.fullName,
    },
    payload,
    chatMessage: message as unknown as Record<string, unknown> | undefined,
  });
}

export async function startRouteMission(missionId: string, providerUserId: string) {
  const { mission, changed } = await advance(
    missionId,
    providerUserId,
    'PROVIDER',
    [MissionStatus.ACCEPTED],
    MissionStatus.EN_ROUTE,
  );
  if (!changed) return { success: true, status: 'EN_ROUTE' };

  // The ETA comes from the artisan's last known position; without one we do not invent a figure.
  let distanceKm: number | undefined;
  let etaMinutes: number | undefined;
  const { currentLat, currentLng } = mission.provider!;
  if (currentLat != null && currentLng != null) {
    distanceKm = calculateDistanceKm(currentLat, currentLng, mission.pickupLat, mission.pickupLng);
    etaMinutes = calculateEtaMinutes(distanceKm);
  }
  const text = etaMinutes !== undefined ? `J'arrive dans ${etaMinutes} min` : 'Je suis en route';

  await announce(
    mission,
    'mission:status_update',
    { status: 'EN_ROUTE', etaMinutes, distanceKm, addressText: mission.addressText, message: text },
    { senderId: providerUserId, content: text },
  );
  return { success: true, status: 'EN_ROUTE', etaMinutes, distanceKm };
}

export async function arrivedAtMission(missionId: string, providerUserId: string) {
  const { mission, changed } = await advance(
    missionId,
    providerUserId,
    'PROVIDER',
    [MissionStatus.ACCEPTED, MissionStatus.EN_ROUTE],
    MissionStatus.ARRIVED,
  );
  if (changed) {
    await announce(
      mission,
      'mission:status_update',
      { status: 'ARRIVED', message: 'Je suis sur place' },
      { senderId: providerUserId, content: 'Je suis sur place' },
    );
  }
  return { success: true, status: 'ARRIVED' };
}

export async function startWorkMission(missionId: string, providerUserId: string) {
  const { mission, changed } = await advance(
    missionId,
    providerUserId,
    'PROVIDER',
    [MissionStatus.ARRIVED],
    MissionStatus.IN_PROGRESS,
    { startedAt: new Date() },
  );
  if (changed) {
    await announce(
      mission,
      'mission:status_update',
      { status: MissionStatus.IN_PROGRESS, startedAt: mission.startedAt, message: 'Intervention démarrée' },
      { senderId: providerUserId, content: 'Intervention démarrée' },
    );
  }
  return { success: true, status: MissionStatus.IN_PROGRESS, startedAt: mission.startedAt };
}

/**
 * The two-sided completion: the artisan declares the work finished (-> DUAL_CONFIRM), then the
 * client confirms (-> COMPLETED). `role` is the caller's account role; it only picks which side acts.
 */
export async function dualConfirmMission(missionId: string, userId: string, role: string) {
  if (role === 'PROVIDER') {
    const { mission, changed } = await advance(
      missionId,
      userId,
      'PROVIDER',
      [MissionStatus.IN_PROGRESS],
      MissionStatus.DUAL_CONFIRM,
    );
    if (changed) {
      await announce(
        mission,
        'mission:status_update',
        {
          status: 'DUAL_CONFIRM',
          providerConfirmed: true,
          clientConfirmed: false,
          message: "L'artisan a indiqué la fin des travaux. Confirmez-vous ?",
        },
        { senderId: userId, content: "Travaux terminés par l'artisan" },
      );
    }
    return { success: true, status: 'DUAL_CONFIRM', providerConfirmed: true };
  }

  // The fixed commission is taken from the artisan's balance in the same transaction that completes the mission.
  const { mission, changed } = await advance(
    missionId,
    userId,
    'CLIENT',
    [MissionStatus.DUAL_CONFIRM],
    MissionStatus.COMPLETED,
    { completedAt: new Date() },
    async (tx, current) => {
      if (!current.providerId) return;
      const fee = Number(current.commissionFee);
      await tx.providerProfile.update({
        where: { id: current.providerId },
        data: { walletBalance: { decrement: Number.isFinite(fee) && fee > 0 ? fee : COMMISSION_FEE_TND } },
      });
    },
  );
  if (changed) {
    await announce(
      mission,
      'mission:completed',
      {
        status: MissionStatus.COMPLETED,
        completedAt: mission.completedAt,
        message: 'Intervention clôturée avec succès !',
      },
      { senderId: userId, content: 'Intervention validée et clôturée' },
    );
  }
  return { success: true, status: MissionStatus.COMPLETED, completedAt: mission.completedAt };
}
