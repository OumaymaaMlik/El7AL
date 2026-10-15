const SECRET_KEYS = new Set(['passwordHash', 'pushToken']);

/** Values that know how to turn themselves into JSON (dates, decimals) are left alone: rebuilding them would break them. */
export const hasOwnJson = (value: object): boolean => typeof (value as { toJSON?: unknown }).toJSON === 'function';

/** Recursively removes credential fields from a response payload (returns a copy only when needed). */
export function stripSecrets<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripSecrets) as unknown as T;
  if (value && typeof value === 'object' && !hasOwnJson(value) && !Buffer.isBuffer(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (!SECRET_KEYS.has(key)) out[key] = stripSecrets(v);
    }
    return out as T;
  }
  return value;
}
