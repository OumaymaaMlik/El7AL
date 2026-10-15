import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { db } from '../config/db.js';
import { kv } from './kvStore.js';
import type { TokenPayload } from '../utils/authGuards.js';

/** The access token is short so a stolen or blocked account stops working quickly; the refresh token renews it. */
export const ACCESS_TOKEN_TTL = '1h';
const REFRESH_TOKEN_TTL = '30d';
const REFRESH_TTL_SECONDS = 30 * 24 * 3600;

const refreshKey = (jti: string) => `refresh:${jti}`;

interface Session {
  token: string;
  refreshToken: string;
}

/** Signs a new access token and a one-use refresh token for an account. */
export async function issueSession(app: FastifyInstance, user: { id: string; role: string }): Promise<Session> {
  const base = { userId: user.id, role: user.role };
  const jti = randomUUID();
  const token = app.jwt.sign(base, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = app.jwt.sign({ ...base, type: 'refresh', jti }, { expiresIn: REFRESH_TOKEN_TTL });
  await kv.set(refreshKey(jti), user.id, REFRESH_TTL_SECONDS);
  return { token, refreshToken };
}

/**
 * Trades a refresh token for a new pair. The old refresh token is used up (so a copy cannot be replayed), and a
 * blocked or deleted account gets nothing. Returns null when the token is not acceptable.
 */
export async function rotateSession(app: FastifyInstance, refreshToken: string): Promise<Session | null> {
  let payload: TokenPayload & { jti?: string };
  try {
    payload = app.jwt.verify(refreshToken);
  } catch {
    return null;
  }
  if (payload.type !== 'refresh' || !payload.jti) return null;
  if ((await kv.del(refreshKey(payload.jti))) === 0) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, status: true },
  });
  if (!user || user.status === 'BLOCKED') return null;
  return issueSession(app, user);
}

/** Signing out: the refresh token stops working. */
export async function endSession(app: FastifyInstance, refreshToken: string): Promise<void> {
  try {
    const payload = app.jwt.verify<TokenPayload & { jti?: string }>(refreshToken);
    if (payload.jti) await kv.del(refreshKey(payload.jti));
  } catch {
    // Already invalid: nothing to end.
  }
}

/** For the sockets: only a real access token opens a connection, never a refresh token. */
export function verifyAccessToken(app: FastifyInstance) {
  return (token: string) => {
    const payload = app.jwt.verify<TokenPayload>(token);
    if (payload.type === 'refresh') throw new Error('Not an access token');
    return payload;
  };
}
