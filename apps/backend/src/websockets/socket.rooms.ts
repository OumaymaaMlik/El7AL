import { db } from '../config/db.js';

/** The authenticated user behind a socket. */
export interface SocketIdentity {
  id: string;
  role: string;
  fullName: string;
}

/**
 * Whether `user` may join a Socket.IO room. A user's own rooms (`user_*`, `provider_*`, `providers`)
 * are joined by the server on connection, so only mission rooms can be requested.
 *
 * A mission room is open to its client and its provider, to admins, and — before anyone has
 * accepted — to artisans, who need it to receive the client's search updates for an offer.
 */
export async function canJoinRoom(user: SocketIdentity, roomId: string): Promise<boolean> {
  if (roomId.startsWith('user_')) return roomId === `user_${user.id}`;
  if (roomId.startsWith('provider_')) return user.role === 'PROVIDER' && roomId === `provider_${user.id}`;
  if (roomId === 'providers') return user.role === 'PROVIDER';

  if (!roomId.startsWith('mission_')) return false;
  if (user.role === 'ADMIN') return true;

  const mission = await db.mission.findUnique({
    where: { id: roomId.slice('mission_'.length) },
    select: {
      status: true,
      providerId: true,
      client: { select: { userId: true } },
      provider: { select: { userId: true } },
    },
  });
  if (!mission) return false;

  if (mission.client?.userId === user.id || mission.provider?.userId === user.id) return true;
  return user.role === 'PROVIDER' && !mission.providerId && ['CREATED', 'BROADCASTED'].includes(mission.status);
}
