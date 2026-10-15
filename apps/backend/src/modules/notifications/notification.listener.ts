/**
 * The only place that decides who is told what when something happens in the platform.
 * Services publish domain events (events/domain-events.ts); here each one becomes real-time events for the
 * connected apps and push notifications for phones. Rules:
 *  - each real-time event is sent once per person (participantRooms chains the rooms in one broadcast);
 *  - a person is never notified of what they did themselves;
 *  - the table of receivers is in docs/API_CONTRACT.md: change both together.
 */
import type { ServerEventName, ServerEvents } from '@el7al/shared';
import { subscribe } from '../../events/domain-events.js';
import { evictFromMissionRoom, getIO, participantRooms } from '../../websockets/socket.gateway.js';
import { pushToUser } from '../../services/pushNotification.service.js';
import { COMMISSION_FEE_TND } from '../../config/business.js';
import { db } from '../../config/db.js';

/** Sends a typed event to a broadcast target, so a payload that does not match the contract does not compile. */
function send<K extends ServerEventName>(
  target: { emit: (event: string, payload: unknown) => unknown },
  event: K,
  payload: ServerEvents[K],
) {
  target.emit(event, payload);
}

let registered = false;

export function registerNotificationListeners(): void {
  if (registered) return;
  registered = true;

  // ---- A client asked for help: the nearby artisans get the offer, the client learns how many were asked.
  subscribe('mission.requested', ({ mission, client, candidateUserIds }) => {
    const io = getIO();
    const offer: ServerEvents['mission:new_offer'] = {
      missionId: mission.id,
      categoryId: mission.categoryId,
      categoryName: mission.categoryName,
      addressText: mission.addressText,
      description: mission.description,
      clientName: client.fullName,
      clientAvatarUrl: client.avatarUrl || null,
      commissionFee: mission.commissionFee || COMMISSION_FEE_TND,
      pickupLat: mission.pickupLat,
      pickupLng: mission.pickupLng,
      createdAt: mission.createdAt,
    };
    for (const userId of candidateUserIds) {
      send(io.to(`provider_${userId}`).to(`user_${userId}`), 'mission:new_offer', offer);
      void pushToUser(
        userId,
        `Nouvelle demande (${mission.categoryName})`,
        `${client.fullName} · ${mission.addressText}`,
        {
          type: 'NEW_OFFER',
          missionId: mission.id,
        },
      );
    }
    send(io.to(`mission_${mission.id}`).to(`user_${client.userId}`), 'mission:offer_dispatched', {
      missionId: mission.id,
      count: candidateUserIds.length,
    });
  });

  // ---- An artisan accepted: both are paired, the others learn the job is gone.
  subscribe('mission.accepted', async ({ missionId, clientUserId, clientName, provider }) => {
    const io = getIO();
    // Artisans who were following the open offer must stop receiving updates of this job.
    await evictFromMissionRoom(missionId, [clientUserId, provider.userId]);
    send(io.to(`user_${clientUserId}`).to(`user_${provider.userId}`).to(`mission_${missionId}`), 'mission:accepted', {
      missionId,
      clientUserId,
      providerUserId: provider.userId,
      clientName,
      provider: {
        id: provider.id,
        fullName: provider.fullName,
        phoneNumber: provider.phoneNumber,
        avatarUrl: provider.avatarUrl,
        ratingAverage: provider.ratingAverage,
      },
    });
    void pushToUser(clientUserId, 'Artisan en route', `${provider.fullName} a accepté votre demande d'intervention.`, {
      missionId,
      type: 'MISSION_ACCEPTED',
    });
    send(io.to('providers').except(`user_${provider.userId}`), 'mission:taken', { missionId });
  });

  // ---- A step was reached, or the job was closed.
  subscribe('mission.progressed', ({ event, mission, payload, chatMessage }) => {
    const rooms = participantRooms(getIO(), mission.id, mission.clientUserId, mission.providerUserId);
    const body = {
      ...payload,
      missionId: mission.id,
      providerName: mission.providerName ?? undefined,
      ...(chatMessage ? { chatMessage } : {}),
    } as ServerEvents['mission:status_update'];
    send(rooms, event, body);
    // The chat line of the step is flagged so apps do not announce it a second time as a chat message.
    if (chatMessage) send(rooms, 'chat:receive', { ...chatMessage, system: true } as ServerEvents['chat:receive']);

    const status = payload.status;
    const data = { missionId: mission.id };
    if (event === 'mission:completed') {
      void pushToUser(
        mission.providerUserId,
        'Mission terminée',
        'Le client a confirmé la fin des travaux. Commission de 30 TND prélevée.',
        { ...data, type: 'MISSION_COMPLETED' },
      );
    } else if (status === 'EN_ROUTE') {
      void pushToUser(
        mission.clientUserId,
        'Artisan en route',
        typeof payload.message === 'string' ? payload.message : 'Votre artisan est en chemin.',
        { ...data, type: 'MISSION_EN_ROUTE' },
      );
    } else if (status === 'ARRIVED') {
      void pushToUser(mission.clientUserId, 'Artisan arrivé', 'Votre artisan est sur place.', {
        ...data,
        type: 'MISSION_ARRIVED',
      });
    } else if (status === 'DUAL_CONFIRM') {
      void pushToUser(mission.clientUserId, 'Travaux terminés', "Confirmez la fin de l'intervention.", {
        ...data,
        type: 'MISSION_DUAL_CONFIRM',
      });
    }
  });

  // ---- Cancelled: only the two people involved hear it; other artisans just lose the open offer.
  subscribe('mission.cancelled', ({ mission, reason, wasAccepted, cancelledBy }) => {
    const io = getIO();
    send(participantRooms(io, mission.id, mission.clientUserId, mission.providerUserId), 'mission:cancelled', {
      missionId: mission.id,
      reason,
      wasAccepted,
      cancelledBy,
    });
    if (!wasAccepted) send(io.to('providers'), 'mission:offer_withdrawn', { missionId: mission.id });
    if (cancelledBy === 'SYSTEM' && mission.clientUserId) {
      void pushToUser(
        mission.clientUserId,
        'Aucun artisan disponible',
        "Personne n'a pu répondre à votre demande. Relancez la recherche.",
        { type: 'MISSION_EXPIRED', missionId: mission.id },
      );
    }
    if (wasAccepted) {
      const other = cancelledBy === 'CLIENT' ? mission.providerUserId : mission.clientUserId;
      void pushToUser(
        other,
        cancelledBy === 'CLIENT' ? 'Mission annulée par le client' : "Intervention annulée par l'artisan",
        reason || "L'intervention a été annulée.",
        { type: 'MISSION_CANCELLED', missionId: mission.id },
      );
    }
  });

  // ---- The client reviewed the artisan.
  subscribe('mission.reviewed', ({ mission, rating, comment, clientName, ratingAverage, totalRatings, amount }) => {
    const target = getIO().to(`mission_${mission.id}`);
    const rooms = mission.providerUserId
      ? target.to(`user_${mission.providerUserId}`).to(`provider_${mission.providerUserId}`)
      : target;
    send(rooms, 'mission:reviewed', {
      missionId: mission.id,
      rating,
      comment,
      clientName,
      ratingAverage,
      totalRatings,
      amount,
    });
    void pushToUser(
      mission.providerUserId,
      `Nouvel avis · ${rating}/5`,
      comment ? `« ${comment} »` : `${clientName} a noté votre intervention.`,
      { type: 'MISSION_REVIEWED', missionId: mission.id },
    );
  });

  // ---- A new artisan is waiting: every admin is told, on screen and on their phone.
  subscribe('provider.registered', async ({ providerId, fullName, createdAt }) => {
    send(getIO().to('admins'), 'admin:artisan_pending', { providerId, fullName, createdAt: createdAt.toISOString() });
    const admins = await db.user.findMany({ where: { role: 'ADMIN', status: 'ACTIVE' }, select: { id: true } });
    for (const admin of admins) {
      void pushToUser(admin.id, 'Nouvel artisan à vérifier', `${fullName} attend votre validation.`, {
        type: 'ARTISAN_PENDING',
        providerId,
      });
    }
  });

  // ---- An admin decided about an artisan's identity check.
  subscribe('provider.verified', ({ userId, status, note }) => {
    send(getIO().to(`user_${userId}`), 'account:verification', { status, note });
    void pushToUser(
      userId,
      status === 'ACTIVE' ? 'Compte vérifié' : 'Vérification refusée',
      status === 'ACTIVE' ? 'Vous pouvez maintenant passer en ligne et recevoir des demandes.' : (note ?? ''),
      { type: 'ACCOUNT_VERIFICATION', status },
    );
  });
}
