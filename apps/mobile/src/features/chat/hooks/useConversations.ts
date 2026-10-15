import { useCallback, useEffect, useState } from 'react';
import { logger } from '../../../shared/utils/logger';
import { getSocket } from '../../../services/socket/socket.client';
import { useAuthStore } from '../../auth';
import type { ChatMessage, Mission } from '../../missions';
import { fetchConversations } from '../api/chat.api';
import { useChatStore } from '../store/useChatStore';
import { countUnreadByMission } from '../utils/unread';

/** The conversation list, kept live by socket events, with unread counts synced to the chat store. */
export function useConversations() {
  const userId = useAuthStore((state) => state.user?.id);
  const [conversations, setConversations] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchConversations();
      if (list) {
        setConversations(list);
        useChatStore.getState().setAllUnreadCounts(countUnreadByMission(list, userId));
      }
    } catch (e) {
      logger.warn('Failed to load conversations history:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();

    const socket = getSocket();
    const onReceive = (msg: ChatMessage) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== msg.missionId) return c;
          const messages = c.messages ?? [];
          return messages.some((m) => m.id === msg.id) ? c : { ...c, messages: [...messages, msg] };
        }),
      );
    };
    const onSeen = (data: { missionId: string; readerId: string; readAt?: string }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.missionId
            ? {
                ...c,
                messages: (c.messages ?? []).map((m) =>
                  m.senderId !== data.readerId ? { ...m, isRead: true, readAt: data.readAt } : m,
                ),
              }
            : c,
        ),
      );
    };

    socket.on('chat:receive', onReceive);
    socket.on('chat:seen', onSeen);
    return () => {
      socket.off('chat:receive', onReceive);
      socket.off('chat:seen', onSeen);
    };
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return { conversations, loading, refreshing, refresh };
}
