import { create } from 'zustand';
import { getSocket } from '../../../services/socket/socket.client';
import { logger } from '../../../shared/utils/logger';
import { fetchMissionHistory } from '../../missions';
import { markMissionRead } from '../api/chat.api';
import { countUnreadByMission } from '../utils/unread';

interface ChatStoreState {
  unreadCounts: Record<string, number>;
  activeMissionId: string | null;
  setActiveMissionId: (missionId: string | null) => void;
  setUnreadCount: (missionId: string, count: number) => void;
  setAllUnreadCounts: (counts: Record<string, number>) => void;
  incrementUnreadCount: (missionId: string) => void;
  clearUnreadForMission: (missionId: string) => void;
  getTotalUnreadCount: () => number;
  markMissionAsRead: (missionId: string, readerId: string) => Promise<void>;
  fetchUnreadSummary: (currentUserId: string) => Promise<void>;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  unreadCounts: {},
  activeMissionId: null,

  setActiveMissionId: (missionId) => set({ activeMissionId: missionId }),

  setUnreadCount: (missionId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [missionId]: Math.max(0, count) },
    })),

  setAllUnreadCounts: (counts) => set({ unreadCounts: counts }),

  incrementUnreadCount: (missionId) =>
    set((state) => {
      // The user is looking at this conversation: nothing to count.
      if (state.activeMissionId === missionId) return state;
      return {
        unreadCounts: { ...state.unreadCounts, [missionId]: (state.unreadCounts[missionId] || 0) + 1 },
      };
    }),

  clearUnreadForMission: (missionId) =>
    set((state) => {
      if (!state.unreadCounts[missionId]) return state;
      const next = { ...state.unreadCounts };
      delete next[missionId];
      return { unreadCounts: next };
    }),

  getTotalUnreadCount: () => Object.values(get().unreadCounts).reduce((sum, val) => sum + (val || 0), 0),

  markMissionAsRead: async (missionId, readerId) => {
    if (!missionId || !readerId) return;

    // Clear the local counter immediately for a snappy UI.
    get().clearUnreadForMission(missionId);

    try {
      // Tell the other party instantly, then persist.
      getSocket().emit('chat:read', { missionId, readerId });
      await markMissionRead(missionId);
    } catch (e) {
      logger.warn('Failed to mark mission as read:', e);
    }
  },

  fetchUnreadSummary: async (currentUserId) => {
    if (!currentUserId) return;
    try {
      const missions = await fetchMissionHistory();
      if (missions) set({ unreadCounts: countUnreadByMission(missions, currentUserId) });
    } catch (e) {
      logger.warn('Failed to fetch chat unread summary:', e);
    }
  },
}));
