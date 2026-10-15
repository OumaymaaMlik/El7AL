/** Mission statuses as stored by the backend (see docs/API_CONTRACT.md). */
export type MissionStatus =
  | 'CREATED'
  | 'BROADCASTED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'DUAL_CONFIRM'
  | 'COMPLETED'
  | 'CANCELLED';

/** An artisan is assigned and the work is not finished. */
const ONGOING_STATUSES: MissionStatus[] = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'DUAL_CONFIRM'];

/** The request is out and nobody has accepted yet. */
const SEARCHING_STATUSES: MissionStatus[] = ['CREATED', 'BROADCASTED'];

export const isOngoing = (status?: string | null): boolean => ONGOING_STATUSES.includes(status as MissionStatus);
export const isSearching = (status?: string | null): boolean => SEARCHING_STATUSES.includes(status as MissionStatus);
/** Searching or ongoing: the mission the client is currently waiting for. */
export const isActive = (status?: string | null): boolean => isOngoing(status) || isSearching(status);

/** Great-circle distance in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** A chat line as the server sends it. */
export interface ChatMessage {
  id?: string;
  missionId: string;
  senderId: string;
  content: string;
  createdAt?: string;
  senderName?: string;
  senderAvatar?: string | null;
  isRead?: boolean;
  /** Sent from this device and not yet confirmed by the server. */
  pending?: boolean;
}

/** A mission as `GET /missions/:id` returns it, as far as the tracking screens read it. */
export interface ApiMission {
  id: string;
  status: MissionStatus;
  addressText: string;
  description?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  radiusKm?: number | null;
  createdAt?: string;
  category?: { name: string } | null;
  client?: { user?: { fullName: string; phoneNumber?: string } } | null;
  provider?: {
    user: { fullName: string; phoneNumber: string; avatarUrl?: string };
    bio?: string;
    categories?: Array<{ category: { name: string } }>;
  } | null;
  messages?: ChatMessage[];
  review?: { rating: number; comment?: string | null } | null;
}
