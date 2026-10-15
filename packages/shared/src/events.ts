/**
 * The real-time contract between the server and the apps: every event the server sends, with its payload.
 * The server types its emits with this, and the apps use `import type` to type their listeners, so a change
 * to a payload breaks the build everywhere it matters instead of failing silently at run time.
 * The human-readable version, with who receives what, is docs/API_CONTRACT.md.
 */

export interface PersonSummary {
  id: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  ratingAverage?: number;
}

export interface NewOfferPayload {
  missionId: string;
  categoryId: string;
  categoryName: string;
  addressText: string;
  description: string | null;
  clientName: string;
  clientAvatarUrl: string | null;
  commissionFee: unknown;
  pickupLat: number;
  pickupLng: number;
  createdAt: string | Date;
}

export interface OfferDispatchedPayload {
  missionId: string;
  count: number;
}

export interface AcceptedPayload {
  missionId: string;
  clientUserId: string;
  providerUserId: string;
  clientName: string;
  provider: PersonSummary;
}

export interface ChatMessagePayload {
  id: string;
  missionId: string;
  senderId: string;
  content: string;
  createdAt: string | Date;
  isRead: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  /** The chat line of a status change: show it in the conversation, do not notify it as a message. */
  system?: boolean;
}

export interface StatusUpdatePayload {
  missionId: string;
  status: string;
  message?: string;
  providerName?: string;
  etaMinutes?: number;
  distanceKm?: number;
  addressText?: string;
  startedAt?: string | Date | null;
  providerConfirmed?: boolean;
  clientConfirmed?: boolean;
  chatMessage?: ChatMessagePayload;
}

export interface CompletedPayload {
  missionId: string;
  status: string;
  completedAt?: string | Date | null;
  message?: string;
  providerName?: string;
  chatMessage?: ChatMessagePayload;
}

export interface CancelledPayload {
  missionId: string;
  reason?: string;
  /** False when nobody had accepted yet. */
  wasAccepted: boolean;
  cancelledBy: 'CLIENT' | 'PROVIDER' | 'SYSTEM';
}

export interface ReviewedPayload {
  missionId: string;
  rating: number;
  /** Exactly what the client wrote, empty when nothing. */
  comment: string;
  clientName: string;
  ratingAverage: number;
  totalRatings: number;
  amount?: string;
}

export interface DelayAlertPayload {
  missionId: string;
  message: string;
  etaMinutes: number;
  distanceKm: number;
}

export interface LocationStreamPayload {
  providerId: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
  timestamp: string;
}

export interface AccountVerificationPayload {
  status: 'ACTIVE' | 'REJECTED';
  /** The reason, when refused. */
  note: string | null;
}

/** Every event the server sends, with its payload. */
export interface ServerEvents {
  'mission:new_offer': NewOfferPayload;
  'mission:offer_dispatched': OfferDispatchedPayload;
  'mission:offer_viewed': { missionId: string; providerName: string; statusText: string };
  'mission:offer_rejected': { missionId: string; providerName: string };
  'mission:offer_withdrawn': { missionId: string };
  'mission:accepted': AcceptedPayload;
  'mission:taken': { missionId: string };
  'mission:status_update': StatusUpdatePayload;
  'mission:completed': CompletedPayload;
  'mission:cancelled': CancelledPayload;
  'mission:reviewed': ReviewedPayload;
  'mission:delay_alert': DelayAlertPayload;
  'location:stream': LocationStreamPayload;
  'chat:receive': ChatMessagePayload;
  'chat:seen': { missionId: string; readerId: string; readAt: string };
  'chat:error': { message: string };
  'account:verification': AccountVerificationPayload;
  /** To admins only: an artisan finished registering and waits for the identity check. */
  'admin:artisan_pending': { providerId: string; fullName: string; createdAt: string };
}

export type ServerEventName = keyof ServerEvents;

/** Every event an app can send to the server. */
export interface ClientEvents {
  join_room: string;
  'chat:send': { missionId: string; content: string };
  'chat:read': { missionId: string };
  'provider:location_update': { lat: number; lng: number; missionId?: string };
  'mission:view_offer': { missionId: string };
  'mission:reject_offer': { missionId: string };
}
