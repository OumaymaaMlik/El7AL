import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { onServerEvent } from '../services/serverEvents';

export interface LiveTrip {
  lat: number | null;
  lng: number | null;
  etaMinutes: number | null;
  distanceKm: number | null;
}

const NONE: LiveTrip = { lat: null, lng: null, etaMinutes: null, distanceKm: null };

/** The artisan's live position, distance and arrival time, as the server streams them while they head to the client. */
export function useLocationStream(enabled: boolean): LiveTrip {
  const [trip, setTrip] = useState<LiveTrip>(NONE);

  useEffect(() => {
    if (!enabled) return;
    return onServerEvent(getSocket(), 'location:stream', (d) =>
      setTrip((prev) => ({
        lat: typeof d.lat === 'number' ? d.lat : prev.lat,
        lng: typeof d.lng === 'number' ? d.lng : prev.lng,
        etaMinutes: typeof d.etaMinutes === 'number' ? d.etaMinutes : prev.etaMinutes,
        distanceKm: typeof d.distanceKm === 'number' ? d.distanceKm : prev.distanceKm,
      })),
    );
  }, [enabled]);

  return trip;
}
