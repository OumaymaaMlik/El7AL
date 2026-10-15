import type { Router } from 'expo-router';
import type { UserSession } from '../features/auth';

/** What a feature needs to react to real-time events for the signed-in user. */
export interface SocketContext {
  user: UserSession;
  isProvider: boolean;
  router: Router;
}
