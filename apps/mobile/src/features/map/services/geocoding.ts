import { logger } from '../../../shared/utils/logger';

const TIMEOUT_MS = 6000;

/** Reverse-geocodes coordinates via OpenStreetMap Nominatim. Returns null on any failure. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { signal: controller.signal, headers: { 'User-Agent': 'El7alConnect/1.0', Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.display_name === 'string' ? data.display_name : null;
  } catch (e) {
    logger.warn('Reverse geocoding error:', e);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
