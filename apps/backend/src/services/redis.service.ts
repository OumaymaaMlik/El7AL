import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
// Development falls back to the docker-compose password; production must configure its own.
if (process.env.NODE_ENV === 'production' && !process.env.REDIS_PASSWORD) {
  throw new Error('REDIS_PASSWORD must be set when NODE_ENV=production.');
}
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'el7al_redis_password_2026';

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  logger.info('Connected to Redis Server');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

const GEO_KEY_ACTIVE_PROVIDERS = 'geo:providers:active';

/**
 * Add or update provider GPS location in Redis Geo index
 */
export async function updateProviderGeoLocation(providerId: string, lat: number, lng: number) {
  // Redis GEOADD takes longitude first, then latitude
  await redis.geoadd(GEO_KEY_ACTIVE_PROVIDERS, lng, lat, providerId);
}

/**
 * Remove provider from active Redis Geo index (e.g. when going offline)
 */
export async function removeProviderGeoLocation(providerId: string) {
  await redis.zrem(GEO_KEY_ACTIVE_PROVIDERS, providerId);
}

/**
 * Find provider IDs within a target radius (in KM) of client location
 */
export async function findNearbyProviderIds(lat: number, lng: number, radiusKm: number): Promise<string[]> {
  const results = await redis.georadius(GEO_KEY_ACTIVE_PROVIDERS, lng, lat, radiusKm, 'km', 'ASC');
  return results as string[];
}

/**
 * Acquire Redis atomic lock to prevent race conditions during job acceptance (Redlock pattern)
 * Returns true if lock acquired successfully, false if already claimed by another provider.
 */
export async function acquireMissionLock(missionId: string, providerId: string, ttlMs = 10000): Promise<boolean> {
  const lockKey = `lock:mission:${missionId}`;
  // SET key value NX PX ttlMs -> atomic set if not exists
  const result = await redis.set(lockKey, providerId, 'PX', ttlMs, 'NX');
  return result === 'OK';
}
