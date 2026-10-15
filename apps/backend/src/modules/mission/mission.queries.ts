import { db } from '../../config/db.js';
import { MissionStatus } from '@el7al/shared';

const HISTORY_PAGE_SIZE = 50;
const HISTORY_MESSAGES_PER_MISSION = 20;

/**
 * A page of the user's missions, newest first. Each mission carries only its most recent
 * messages (oldest first) so the payload stays small however long a conversation is.
 * Pass the last mission's id as `cursor` to get the next page.
 */
export async function getMissionHistory(
  userId: string,
  role: string,
  options: { limit?: number; cursor?: string } = {},
) {
  const take = Math.min(Math.max(options.limit ?? HISTORY_PAGE_SIZE, 1), 100);
  const page = {
    take,
    orderBy: { createdAt: 'desc' as const },
    ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
  };
  const unreadOf = { _count: { select: { messages: { where: { isRead: false, senderId: { not: userId } } } } } };
  const recentMessages = { orderBy: { createdAt: 'desc' as const }, take: HISTORY_MESSAGES_PER_MISSION };

  let missions;
  if (role === 'CLIENT') {
    const clientProfile = await db.clientProfile.findUnique({ where: { userId } });
    if (!clientProfile) return [];
    missions = await db.mission.findMany({
      where: { clientId: clientProfile.id },
      include: {
        category: true,
        provider: { include: { user: true } },
        messages: recentMessages,
        review: true,
        ...unreadOf,
      },
      ...page,
    });
  } else {
    const providerProfile = await db.providerProfile.findUnique({ where: { userId } });
    if (!providerProfile) return [];
    missions = await db.mission.findMany({
      where: { providerId: providerProfile.id },
      include: {
        category: true,
        client: { include: { user: true } },
        messages: recentMessages,
        review: true,
        ...unreadOf,
      },
      ...page,
    });
  }
  return missions.map(({ _count, ...m }) => ({
    ...m,
    messages: [...m.messages].reverse(),
    // Total unread, independent of how many messages are included above.
    unreadCount: _count.messages,
  }));
}

/** Lifetime totals shown next to the paginated history. */
export async function getMissionTotals(userId: string, role: string) {
  const where =
    role === 'CLIENT'
      ? { client: { userId }, status: MissionStatus.COMPLETED }
      : { provider: { userId }, status: MissionStatus.COMPLETED };
  return { completedCount: await db.mission.count({ where }) };
}

/** A mission the user may see: its client, its artisan, or an admin. Anyone else gets "not found". */
export async function getMissionForUser(missionId: string, userId: string, role: string) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: {
      category: true,
      client: { include: { user: true } },
      provider: { include: { user: true } },
      messages: { orderBy: { createdAt: 'asc' } },
      review: true,
    },
  });
  if (!mission) return null;
  const participant = mission.client?.userId === userId || mission.provider?.userId === userId;
  return participant || role === 'ADMIN' ? mission : null;
}
