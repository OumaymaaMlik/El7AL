import * as Location from 'expo-location';
import { logger } from '../../../shared/utils/logger';

const POSITION_TIMEOUT_MS = 8000;

/** Rejects when `promise` has not settled in time (a browser can leave a location request pending forever). */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Location request timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export interface Coords {
  lat: number;
  lng: number;
}

/** Asks for foreground location permission once; returns whether it is granted. */
export async function ensureLocationPermission(): Promise<boolean> {
  try {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    return (await Location.requestForegroundPermissionsAsync()).granted;
  } catch (e) {
    logger.warn('Location permission check failed:', e);
    return false;
  }
}

/** The device's current position, or null when permission is denied or no fix could be obtained. */
export async function getCurrentCoords(): Promise<Coords | null> {
  if (!(await withTimeout(ensureLocationPermission(), POSITION_TIMEOUT_MS).catch(() => false))) return null;
  try {
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      POSITION_TIMEOUT_MS,
    );
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch (e) {
    logger.warn('Could not read the current position:', e);
    try {
      const last = await withTimeout(Location.getLastKnownPositionAsync(), 2000);
      return last ? { lat: last.coords.latitude, lng: last.coords.longitude } : null;
    } catch {
      return null;
    }
  }
}

/** Calls `onPosition` as the device moves (about every 20 s or 50 m; every 4 s or 10 m when `live`). Returns a function that stops watching. */
export async function watchCoords(
  onPosition: (coords: Coords) => void,
  options: { live?: boolean } = {},
): Promise<() => void> {
  if (!(await ensureLocationPermission())) return () => {};
  try {
    const subscription = await Location.watchPositionAsync(
      options.live
        ? { accuracy: Location.Accuracy.High, timeInterval: 4000, distanceInterval: 10 }
        : { accuracy: Location.Accuracy.Balanced, timeInterval: 20000, distanceInterval: 50 },
      (position) => onPosition({ lat: position.coords.latitude, lng: position.coords.longitude }),
    );
    return () => {
      // On web, expo-location's remove() can throw (removeSubscription is missing); stopping must never crash the app.
      try {
        subscription.remove();
      } catch (e) {
        logger.warn('Could not stop watching the position:', e);
      }
    };
  } catch (e) {
    logger.warn('Could not start watching the position:', e);
    return () => {};
  }
}
