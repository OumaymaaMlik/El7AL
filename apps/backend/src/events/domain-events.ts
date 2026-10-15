import { logger } from '../utils/logger.js';
/**
 * Domain events: a service says what happened ("a mission was accepted"), and whoever cares reacts.
 * The mission, admin and other services no longer send sockets or push notifications themselves: the
 * notification module listens (see modules/notifications). This keeps the rules about WHO is told WHAT in one place.
 */

export interface MissionRef {
  id: string;
  clientUserId?: string | null;
  providerUserId?: string | null;
  providerName?: string | null;
}

export interface DomainEvents {
  /** A client asked for help; these artisans are offered the job. */
  'mission.requested': {
    mission: {
      id: string;
      categoryId: string;
      categoryName: string;
      addressText: string;
      description: string | null;
      commissionFee: unknown;
      pickupLat: number;
      pickupLng: number;
      createdAt: Date;
    };
    client: { userId: string; fullName: string; avatarUrl: string | null };
    candidateUserIds: string[];
  };
  /** An artisan took the job. */
  'mission.accepted': {
    missionId: string;
    clientUserId: string;
    clientName: string;
    clientPushToken?: never;
    provider: {
      id: string;
      userId: string;
      fullName: string;
      phoneNumber: string;
      avatarUrl: string | null;
      ratingAverage: number;
    };
  };
  /** The job moved to a new step (en route, arrived, in progress, finished) or was closed. */
  'mission.progressed': {
    event: 'mission:status_update' | 'mission:completed';
    mission: MissionRef;
    payload: Record<string, unknown>;
    chatMessage?: Record<string, unknown>;
  };
  'mission.cancelled': {
    mission: MissionRef;
    reason: string;
    wasAccepted: boolean;
    cancelledBy: 'CLIENT' | 'PROVIDER' | 'SYSTEM';
  };
  'mission.reviewed': {
    mission: MissionRef;
    rating: number;
    comment: string;
    clientName: string;
    ratingAverage: number;
    totalRatings: number;
    amount?: string;
  };
  /** An admin approved or refused an artisan's identity check. */
  /** An artisan finished registering: the admins are told there is someone to verify. */
  'provider.registered': { providerId: string; fullName: string; createdAt: Date };
  'provider.verified': { userId: string; status: 'ACTIVE' | 'REJECTED'; note: string | null };
}

type Handler<K extends keyof DomainEvents> = (payload: DomainEvents[K]) => Promise<void> | void;

const handlers: { [K in keyof DomainEvents]?: Handler<K>[] } = {};

export function subscribe<K extends keyof DomainEvents>(event: K, handler: Handler<K>): void {
  (handlers[event] ??= []).push(handler as never);
}

/**
 * Tells every listener, one after the other. A listener that fails is logged and never breaks the action that
 * published the event: a missed notification must not undo an accepted mission.
 */
export async function publish<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): Promise<void> {
  for (const handler of handlers[event] ?? []) {
    try {
      await (handler as Handler<K>)(payload);
    } catch (e) {
      logger.warn({ err: e }, `Listener of ${event} failed`);
    }
  }
}
