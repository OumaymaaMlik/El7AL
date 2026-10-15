import { db } from '../../config/db.js';
import { getIO, participantRooms } from '../../websockets/socket.gateway.js';
import { getMissionForUser } from './mission.queries.js';

/**
 * Marks as read every message the other person sent in a mission, and tells both people (once each)
 * so the "seen" ticks update. Returns false when the mission is not visible to this user.
 */
export async function markMessagesRead(missionId: string, readerId: string, role: string): Promise<boolean> {
  const visible = await getMissionForUser(missionId, readerId, role);
  if (!visible) return false;

  const readAt = new Date();
  await db.chatMessage.updateMany({
    where: { missionId, senderId: { not: readerId }, isRead: false },
    data: { isRead: true, readAt },
  });

  try {
    participantRooms(getIO(), missionId, visible.client?.userId, visible.provider?.userId).emit('chat:seen', {
      missionId,
      readerId,
      readAt: readAt.toISOString(),
    });
  } catch {
    // The sockets are not running (scripts, tests): the messages are marked, nobody is listening.
  }
  return true;
}
