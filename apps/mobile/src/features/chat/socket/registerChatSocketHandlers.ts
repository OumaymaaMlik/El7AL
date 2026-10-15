import { translate } from '../../../shared/store/useLanguageStore';
import { getSocket } from '../../../services/socket/socket.client';
import type { SocketContext } from '../../../types/socket';
import { useNotificationStore } from '../../notifications';
import { useMissionStore } from '../../missions';
import type { ChatMessage } from '../../missions';
import { useChatStore } from '../store/useChatStore';

/** Subscribes to chat events app-wide (unread counts and banners). Returns the cleanup. */
export function registerChatSocketHandlers({ user, isProvider }: SocketContext): () => void {
  const socket = getSocket();

  const onReceive = (msg: ChatMessage & { sender?: { fullName?: string; avatarUrl?: string } }) => {
    if (!msg.senderId || msg.senderId === user.id) return;

    // No banner when the user is already inside that conversation.
    if (useChatStore.getState().activeMissionId === msg.missionId) return;

    useChatStore.getState().incrementUnreadCount(msg.missionId as string);

    let senderName = msg.senderName || msg.sender?.fullName;
    let senderAvatar = msg.senderAvatar || msg.sender?.avatarUrl || null;

    if (!senderName) {
      const { activeMission, activePairingProvider } = useMissionStore.getState();
      if (activeMission && activeMission.id === msg.missionId) {
        const partner = isProvider ? activeMission.client?.user : activeMission.provider?.user || activePairingProvider;
        if (partner) {
          senderName = partner.fullName ?? undefined;
          senderAvatar = partner.avatarUrl || null;
        }
      }
    }

    const displayName = senderName || translate('notifNewMessage');
    useNotificationStore.getState().addNotification({
      type: 'CHAT',
      title: displayName,
      message: msg.content || translate('notifNewMessageBody'),
      metadata: {
        missionId: msg.missionId ?? undefined,
        senderName: displayName,
        senderAvatar: senderAvatar ?? undefined,
      },
      senderName: displayName,
      senderAvatar,
    });
  };

  const onSeen = (data: { missionId?: string; readerId?: string }) => {
    if (data?.missionId && data?.readerId === user.id) {
      useChatStore.getState().clearUnreadForMission(data.missionId);
    }
  };

  socket.on('chat:receive', onReceive);
  socket.on('chat:seen', onSeen);
  return () => {
    socket.off('chat:receive', onReceive);
    socket.off('chat:seen', onSeen);
  };
}
