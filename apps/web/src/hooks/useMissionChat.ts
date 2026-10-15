import { useCallback, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';
import type { ChatMessage } from '../lib/mission';

/**
 * One mission's conversation over the socket, shared by every chat view.
 * The server identifies the sender from the login token, so only the text is sent; a message shows
 * as "pending" until the server's copy arrives, and incoming messages are marked as read.
 */
export function useMissionChat(missionId: string | undefined, initialMessages: ChatMessage[] = []) {
  const userId = useAuthStore((s) => s.user?.id);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // History from the server (re)loads the list
  useEffect(() => {
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, initialMessages.length]);

  useEffect(() => {
    if (!missionId) return;
    const socket = getSocket();
    socket.emit('join_room', `mission_${missionId}`);
    socket.emit('chat:read', { missionId });

    const onReceive = (msg: ChatMessage) => {
      if (msg.missionId !== missionId) return;
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        const pendingIndex = prev.findIndex(
          (m) => m.pending && m.senderId === msg.senderId && m.content === msg.content,
        );
        const next = pendingIndex >= 0 ? prev.filter((_, i) => i !== pendingIndex) : prev;
        return [...next, msg];
      });
      if (msg.senderId !== userId) socket.emit('chat:read', { missionId });
    };
    const onSeen = (data: { missionId?: string; readerId?: string }) => {
      if (data?.missionId !== missionId || data.readerId === userId) return;
      setMessages((prev) => prev.map((m) => (m.senderId === userId ? { ...m, isRead: true } : m)));
    };

    socket.on('chat:receive', onReceive);
    socket.on('chat:seen', onSeen);
    return () => {
      socket.off('chat:receive', onReceive);
      socket.off('chat:seen', onSeen);
    };
  }, [missionId, userId]);

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content || !missionId || !userId) return;
      getSocket().emit('chat:send', { missionId, content });
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          missionId,
          senderId: userId,
          content,
          createdAt: new Date().toISOString(),
          pending: true,
        },
      ]);
    },
    [missionId, userId],
  );

  return { messages, send, userId };
}
