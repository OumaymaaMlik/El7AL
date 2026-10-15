import { useEffect, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import { logger } from '../../../shared/utils/logger';
import { getSocket, joinMissionRoom } from '../../../services/socket/socket.client';
import { useAuthStore } from '../../auth';
import { fetchMission, type ChatMessage } from '../../missions';
import { useChatStore } from '../store/useChatStore';

/** A message plus the local "sending" marker used before the server echoes it back. */
export type ThreadMessage = ChatMessage & { pending?: boolean };

interface Partner {
  name?: string | null;
  avatar?: string | null;
}

/**
 * One conversation's data: history, live messages and read receipts over the socket,
 * optimistic sending, and tracking that this conversation is the one on screen.
 */
export function useChatThread(missionId: string, partnerName?: string, partnerAvatar?: string | null) {
  const user = useAuthStore((state) => state.user);

  const [partner, setPartner] = useState<Partner>({ name: partnerName, avatar: partnerAvatar });
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToEnd = (animated: boolean) => setTimeout(() => scrollRef.current?.scrollToEnd({ animated }), 100);

  useEffect(() => {
    if (partnerName || partnerAvatar) {
      setPartner((prev) => ({
        name: partnerName || prev.name,
        avatar: partnerAvatar !== undefined ? partnerAvatar : prev.avatar,
      }));
    }
  }, [partnerName, partnerAvatar]);

  useEffect(() => {
    if (!missionId) return;
    let cancelled = false;
    const chat = useChatStore.getState();

    // This conversation is now the one on screen.
    chat.setActiveMissionId(missionId);
    if (user?.id) chat.markMissionAsRead(missionId, user.id);

    const loadHistory = async () => {
      setLoading(true);
      try {
        const mission = await fetchMission(missionId);
        if (cancelled || !mission) return;
        if (Array.isArray(mission.messages)) {
          setMessages(mission.messages);
          scrollToEnd(false);
        }
        const other = user?.role === 'PROVIDER' ? mission.client?.user : mission.provider?.user;
        if (other) {
          setPartner({ name: other.fullName || partnerName, avatar: other.avatarUrl || partnerAvatar });
        }
        if (user?.id && useChatStore.getState().activeMissionId === missionId) {
          useChatStore.getState().markMissionAsRead(missionId, user.id);
        }
      } catch (e) {
        logger.warn('Failed to load chat history:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setMessages([]);
    loadHistory();

    const socket = getSocket();
    joinMissionRoom(missionId);

    const onReceive = (msg: ChatMessage) => {
      // Ignore messages that belong to another mission's room.
      if (msg.missionId && msg.missionId !== missionId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        // The server's copy of my own message replaces the local "sending" one.
        const pendingIndex = prev.findIndex(
          (m) => m.pending && m.senderId === msg.senderId && m.content === msg.content,
        );
        const next = pendingIndex >= 0 ? prev.filter((_, i) => i !== pendingIndex) : prev;
        return [...next, msg];
      });
      scrollToEnd(true);

      // Only mark as read when the user is actively viewing this conversation.
      const active = useChatStore.getState().activeMissionId === missionId;
      if (active && msg.senderId && msg.senderId !== user?.id && user?.id) {
        useChatStore.getState().markMissionAsRead(missionId, user.id);
      }
    };

    const onSeen = (data: { missionId?: string; readerId?: string; readAt?: string }) => {
      if (data?.missionId === missionId && data?.readerId !== user?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true, readAt: data.readAt } : m)),
        );
      }
    };

    socket.on('chat:receive', onReceive);
    socket.on('chat:seen', onSeen);
    return () => {
      cancelled = true;
      socket.off('chat:receive', onReceive);
      socket.off('chat:seen', onSeen);
      useChatStore.getState().setActiveMissionId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, user?.id]);

  const send = (text: string): boolean => {
    const content = text.trim();
    if (!content || !user?.id || !missionId) return false;

    getSocket().emit('chat:send', { missionId, senderId: user.id, content });
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        missionId,
        senderId: user.id,
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);
    scrollToEnd(true);
    return true;
  };

  return { messages, loading, partner, scrollRef, send, userId: user?.id };
}
