import { useEffect, useRef } from 'react';

export interface Position {
  lat: number;
  lng: number;
}

/** One position fix, or null when the browser refuses or has no location. */
export function getPosition(timeoutMs = 8000): Promise<Position | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 30000 },
    );
  });
}

/**
 * Calls `onPosition` as the device moves, at most once per `minIntervalMs`, while `enabled`.
 * Stops watching when disabled or unmounted.
 */
export function useWatchPosition(enabled: boolean, onPosition: (position: Position) => void, minIntervalMs = 4000) {
  const callback = useRef(onPosition);
  callback.current = onPosition;

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;
    let last = 0;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const now = Date.now();
        if (now - last < minIntervalMs) return;
        last = now;
        callback.current({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [enabled, minIntervalMs]);
}
