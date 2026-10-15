import type { ServerEvents } from '@el7al/shared';
import type { Mission } from './schemas/mission.schema';

/** An offer as the server pushes it to an artisan. */
export type IncomingOffer = ServerEvents['mission:new_offer'];

/** The artisan paired with a request, as announced when they accept. */
export interface PairedProvider {
  id?: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  ratingAverage?: number | string | null;
}

/** What a client wrote about an artisan, as pushed when the review is saved. */
export type ReviewData = ServerEvents['mission:reviewed'];

/** The mission the app is following: what the server returns for a mission, kept as it arrives. */
export type ActiveMission = Mission;
