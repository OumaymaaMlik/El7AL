import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../config/env';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { logger } from '../../shared/utils/logger';

let socketInstance: Socket | null = null;
let currentUserId: string | null = null;
const activeMissionRooms = new Set<string>();

function reJoinAllRooms(socket: Socket) {
  if (currentUserId) {
    socket.emit('join_room', `user_${currentUserId}`);
    socket.emit('join_room', `provider_${currentUserId}`);
    socket.emit('join_room', 'providers');
  }

  activeMissionRooms.forEach((missionId) => {
    socket.emit('join_room', `mission_${missionId}`);
  });
}

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      auth: (cb) => cb({ token: useAuthStore.getState().token }),
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on('connect', () => {
      if (socketInstance) {
        reJoinAllRooms(socketInstance);
      }
    });

    socketInstance.on('connect_error', (err) => {
      logger.warn('⚠️ Socket connection error:', err.message);
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}

export function joinUserRoom(userId: string) {
  currentUserId = userId;
  const socket = getSocket();
  socket.emit('join_room', `user_${userId}`);
  socket.emit('join_room', `provider_${userId}`);
  socket.emit('join_room', 'providers');
}

export function joinMissionRoom(missionId: string) {
  if (!missionId) return;
  activeMissionRooms.add(missionId);
  const socket = getSocket();
  socket.emit('join_room', `mission_${missionId}`);
}

export function leaveMissionRoom(missionId: string) {
  if (!missionId) return;
  activeMissionRooms.delete(missionId);
}

/** Forgets the user's rooms and closes the connection, which is authenticated as that user. */
export function resetSocketRooms() {
  currentUserId = null;
  activeMissionRooms.clear();
  socketInstance?.disconnect();
}
