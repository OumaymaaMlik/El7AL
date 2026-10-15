import type { ServerEvents } from '@el7al/shared';
import type { Socket } from 'socket.io-client';

/**
 * Listens to one server event with a payload typed by the shared contract (packages/shared/src/events.ts).
 * Returns the function that stops listening. A misspelled event name or a wrong payload field does not compile.
 */
export function onServerEvent<K extends keyof ServerEvents>(
  socket: Socket,
  event: K,
  handler: (payload: ServerEvents[K]) => void,
): () => void {
  const listener = handler;
  socket.on(event as string, listener);
  return () => {
    socket.off(event as string, listener);
  };
}
