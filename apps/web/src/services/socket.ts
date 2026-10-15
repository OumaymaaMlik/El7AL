import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { SOCKET_URL } from './config';

let socket: Socket | null = null;
let watchingAuth = false;

/** Re-authenticates the connection when the user logs in, out or switches account. */
function watchAuthChanges() {
  if (watchingAuth) return;
  watchingAuth = true;
  let lastToken = useAuthStore.getState().token;
  useAuthStore.subscribe((state) => {
    if (state.token === lastToken) return;
    lastToken = state.token;
    if (!socket) return;
    socket.disconnect();
    if (state.token) socket.connect();
  });
}

/**
 * The single Socket.IO connection. The server identifies the user from the token and puts them in
 * their own rooms; the token is read at every (re)connection so it is never stale.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => cb({ token: useAuthStore.getState().token }),
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    watchAuthChanges();
  }
  if (!socket.connected && !socket.active && useAuthStore.getState().token) socket.connect();
  return socket;
}
