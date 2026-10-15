import { redis } from './redis.service.js';

/**
 * Where the counters live: Redis when it is connected, a small in-memory table when it is not (development
 * without Docker). The memory table forgets on restart, which is fine for 10-minute codes.
 */
const memory = new Map<string, { value: string; expiresAt: number }>();
const useRedis = () => redis.status === 'ready';

export const kv = {
  async get(k: string): Promise<string | null> {
    if (useRedis()) return redis.get(k);
    const entry = memory.get(k);
    if (!entry || entry.expiresAt < Date.now()) return null;
    return entry.value;
  },
  async set(k: string, value: string, ttlSeconds: number): Promise<void> {
    if (useRedis()) await redis.set(k, value, 'EX', ttlSeconds);
    else memory.set(k, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },
  async del(...keys: string[]): Promise<number> {
    if (useRedis()) return redis.del(...keys);
    return keys.filter((k) => memory.delete(k)).length;
  },
  async exists(k: string): Promise<boolean> {
    return (await kv.get(k)) !== null;
  },
  /** Adds one, starting the expiry on the first count. */
  async incr(k: string, ttlSeconds: number): Promise<number> {
    if (useRedis()) {
      const n = await redis.incr(k);
      if (n === 1) await redis.expire(k, ttlSeconds);
      return n;
    }
    const n = Number((await kv.get(k)) ?? 0) + 1;
    const existing = memory.get(k);
    memory.set(k, {
      value: String(n),
      expiresAt: existing && existing.expiresAt > Date.now() ? existing.expiresAt : Date.now() + ttlSeconds * 1000,
    });
    return n;
  },
};
