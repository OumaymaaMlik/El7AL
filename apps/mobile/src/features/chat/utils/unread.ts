import type { Mission } from '../../missions';

/** Counts, per mission, the messages sent by the other party that have not been read yet. */
export function countUnreadByMission(missions: Mission[], currentUserId?: string | null): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const mission of missions) {
    // The server counts every unread message; the messages sent along are only the latest ones.
    const unread =
      mission.unreadCount ?? (mission.messages ?? []).filter((m) => m.senderId !== currentUserId && !m.isRead).length;
    if (unread > 0) counts[mission.id] = unread;
  }
  return counts;
}
