import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { joinUserRoom } from '../services/socket/socket.client';
import { useAuthStore } from '../features/auth';
import { registerChatSocketHandlers, useChatStore } from '../features/chat';
import { registerMissionSocketHandlers } from '../features/missions/socket/registerMissionSocketHandlers';

/**
 * App-wide real-time wiring: joins the user's room and lets each feature subscribe to the
 * socket events it owns (chat, missions). Renders nothing.
 */
export function GlobalSocketListener() {
  const router = useRouter();
  // The handlers use the router that exists when they are registered; it must not re-subscribe the sockets.
  const routerRef = useRef(router);
  routerRef.current = router;
  const user = useAuthStore((state) => state.user);
  const activeRole = useAuthStore((state) => state.activeRole);

  useEffect(() => {
    if (!user?.id) return;

    joinUserRoom(user.id);
    useChatStore.getState().fetchUnreadSummary(user.id);

    const context = {
      user,
      router: routerRef.current,
      isProvider: activeRole === 'PROVIDER' || user.role === 'PROVIDER',
    };
    const cleanups = [registerChatSocketHandlers(context), registerMissionSocketHandlers(context)];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [user, activeRole]);

  return null;
}
