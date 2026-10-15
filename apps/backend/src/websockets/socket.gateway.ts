import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { updateProviderGeoLocation } from '../services/redis.service.js';
import { db } from '../config/db.js';
import { allowedOrigins } from '../config/security.js';
import { calculateDistanceKm, calculateEtaMinutes } from '../utils/geo.js';
import { canJoinRoom, type SocketIdentity } from './socket.rooms.js';
import { pushToUser } from '../services/pushNotification.service.js';
import { logger } from '../utils/logger.js';

let io: Server | null = null;

// Track last known ETAs per mission to detect delay spikes
const missionEtaMap: Record<string, number> = {};

type VerifyToken = (token: string) => { userId: string };

/** The authenticated user attached to a socket by the connection middleware. */
function identityOf(socket: Socket): SocketIdentity {
  return socket.data.user as SocketIdentity;
}

/** Returns the mission with its participants' user ids when `userId` takes part in it, otherwise null. */
async function findMissionForParticipant(missionId: string, userId: string) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: {
      client: { select: { userId: true } },
      provider: { select: { userId: true } },
    },
  });
  if (!mission) return null;
  const isParticipant = mission.client?.userId === userId || mission.provider?.userId === userId;
  return isParticipant ? mission : null;
}

export function initSocketGateway(server: HttpServer, verifyToken: VerifyToken) {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins(),
      methods: ['GET', 'POST'],
    },
  });

  // Every connection must present a valid access token of an active account.
  io.use(async (socket, next) => {
    try {
      const header = socket.handshake.headers.authorization;
      const token =
        (typeof socket.handshake.auth?.token === 'string' && socket.handshake.auth.token) ||
        (typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '');
      if (!token) return next(new Error('unauthorized'));

      const { userId } = verifyToken(token);
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, status: true, fullName: true },
      });
      if (!user || user.status === 'BLOCKED') return next(new Error('unauthorized'));

      socket.data.user = { id: user.id, role: user.role, fullName: user.fullName } satisfies SocketIdentity;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const me = identityOf(socket);

    // A user's own rooms are joined on the server, never requested by the client.
    socket.join(`user_${me.id}`);
    if (me.role === 'PROVIDER') {
      socket.join(`provider_${me.id}`);
      socket.join('providers');
    }
    if (me.role === 'ADMIN') socket.join('admins');

    // Join an additional room (a mission the user takes part in). Anything else is ignored.
    socket.on('join_room', async (roomId: unknown) => {
      try {
        if (typeof roomId !== 'string') return;
        if (!(await canJoinRoom(me, roomId))) return;
        await socket.join(roomId);
        // The mission may have been accepted while we were checking: confirm once more after joining.
        if (!(await canJoinRoom(me, roomId))) socket.leave(roomId);
      } catch (err) {
        logger.error({ err }, 'Error handling join_room');
      }
    });

    // 1. Live Technician Location Update & ETA Stream
    socket.on('provider:location_update', async (data: { lat: number; lng: number; missionId?: string }) => {
      try {
        if (me.role !== 'PROVIDER') return;
        const { lat, lng, missionId } = data;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const profile = await db.providerProfile.findUnique({
          where: { userId: me.id },
          select: { id: true },
        });
        if (!profile) return;
        const providerId = profile.id;

        await updateProviderGeoLocation(providerId, lat, lng);

        // If provider is in active mission, calculate ETA & stream location to client
        if (missionId) {
          const mission = await db.mission.findUnique({
            where: { id: missionId },
            include: { client: { select: { userId: true } } },
          });

          // Only the provider assigned to the mission can stream its location.
          if (mission && mission.providerId === providerId && mission.pickupLat && mission.pickupLng) {
            const distanceKm = calculateDistanceKm(lat, lng, mission.pickupLat, mission.pickupLng);
            const etaMinutes = calculateEtaMinutes(distanceKm);

            // Detect delay spike (> 5 min increase from previous minimum ETA)
            const prevEta = missionEtaMap[missionId];
            if (prevEta !== undefined && etaMinutes >= prevEta + 5) {
              io?.to(`mission_${missionId}`)
                .to(`user_${mission.client.userId}`)
                .emit('mission:delay_alert', {
                  missionId,
                  message: `Retard important détecté : arrivée estimée à ${etaMinutes} min.`,
                  etaMinutes,
                  distanceKm,
                });
            }

            if (prevEta === undefined || etaMinutes < prevEta) {
              missionEtaMap[missionId] = etaMinutes;
            }

            // Stream real-time location and ETA to room
            io?.to(`mission_${missionId}`).emit('location:stream', {
              providerId,
              lat,
              lng,
              distanceKm,
              etaMinutes,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        logger.error({ err }, 'Error handling location update');
      }
    });

    // 2. Real-Time In-App Messaging (Immediate Chat After Acceptance)
    socket.on('chat:send', async (data: { missionId: string; content: string }) => {
      try {
        const { missionId, content } = data ?? {};
        if (typeof missionId !== 'string' || typeof content !== 'string' || !content.trim()) return;

        // The sender is always the authenticated user, whatever the client claims.
        const mission = await findMissionForParticipant(missionId, me.id);
        if (!mission) {
          socket.emit('chat:error', { message: 'Mission introuvable.' });
          return;
        }

        const message = await db.chatMessage.create({
          data: { missionId, senderId: me.id, content: content.trim().slice(0, 2000) },
        });

        const senderUser = await db.user.findUnique({
          where: { id: me.id },
          select: { id: true, fullName: true, avatarUrl: true },
        });

        const enrichedMessage = {
          ...message,
          senderName: senderUser?.fullName || 'Utilisateur',
          senderAvatar: senderUser?.avatarUrl || null,
        };

        // One broadcast to the mission room and the other participant's personal room: a socket in both gets it once.
        const otherUserId = mission.client?.userId === me.id ? mission.provider?.userId : mission.client?.userId;
        const target = io?.to(`mission_${missionId}`);
        (otherUserId ? target?.to(`user_${otherUserId}`) : target)?.emit('chat:receive', enrichedMessage);

        void pushToUser(otherUserId, enrichedMessage.senderName, enrichedMessage.content, { type: 'CHAT', missionId });
      } catch (err) {
        logger.error({ err }, 'Error sending chat message');
      }
    });

    // 2b. Message Read / Seen Receipts
    socket.on('chat:read', async (data: { missionId: string }) => {
      try {
        const missionId = data?.missionId;
        if (typeof missionId !== 'string') return;

        const mission = await findMissionForParticipant(missionId, me.id);
        if (!mission) return;

        await db.chatMessage.updateMany({
          where: { missionId, senderId: { not: me.id }, isRead: false },
          data: { isRead: true, readAt: new Date() },
        });

        const seenPayload = { missionId, readerId: me.id, readAt: new Date().toISOString() };

        participantRooms(io as Server, missionId, mission.client?.userId, mission.provider?.userId).emit(
          'chat:seen',
          seenPayload,
        );
      } catch (err) {
        logger.error({ err }, 'Error handling chat:read event');
      }
    });

    // 3. Provider Views Offer Event Notification to Client
    socket.on('mission:view_offer', (data: { missionId: string }) => {
      if (me.role !== 'PROVIDER' || typeof data?.missionId !== 'string') return;
      io?.to(`mission_${data.missionId}`).emit('mission:offer_viewed', {
        missionId: data.missionId,
        providerName: me.fullName,
        statusText: `Offre examinée par ${me.fullName}...`,
      });
    });

    // 4. Provider Rejects Offer Notification to Client
    socket.on('mission:reject_offer', (data: { missionId: string }) => {
      if (me.role !== 'PROVIDER' || typeof data?.missionId !== 'string') return;
      io?.to(`mission_${data.missionId}`).emit('mission:offer_rejected', {
        missionId: data.missionId,
        providerName: me.fullName || 'Un prestataire',
      });
    });
  });

  return io;
}

/**
 * The sockets of a mission's participants as ONE broadcast: the mission room, the client's personal room and the
 * artisan's two personal rooms. A socket in several of them still receives the event once; separate emits
 * to each room (what was done before) delivered the same event two to five times.
 */
export function participantRooms(
  io: Server,
  missionId: string,
  clientUserId?: string | null,
  providerUserId?: string | null,
) {
  let target = io.to(`mission_${missionId}`);
  if (clientUserId) target = target.to(`user_${clientUserId}`);
  if (providerUserId) target = target.to(`user_${providerUserId}`).to(`provider_${providerUserId}`);
  return target;
}

/** Closes every live connection (used when the server shuts down). */
export async function closeSocketGateway(): Promise<void> {
  if (!io) return;
  await new Promise<void>((resolve) => io?.close(() => resolve()));
  io = null;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io server has not been initialized');
  }
  return io;
}

/**
 * Once a mission is accepted only its client and artisan may stay in its room. Artisans who joined
 * while it was still an open offer (to follow the search) are removed so they stop receiving updates.
 */
export async function evictFromMissionRoom(missionId: string, keepUserIds: string[]): Promise<void> {
  const room = `mission_${missionId}`;
  const sockets = await getIO().in(room).fetchSockets();
  sockets.forEach((s) => {
    const id = (s.data.user as { id?: string } | undefined)?.id;
    if (!id || !keepUserIds.includes(id)) s.leave(room);
  });
}
