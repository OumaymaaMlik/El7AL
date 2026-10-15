import type { FastifyReply, FastifyRequest } from 'fastify';
import { db } from '../config/db.js';

/** The content of a login token. */
export interface TokenPayload {
  userId: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  /** Set on refresh tokens only; they must never open a protected route. */
  type?: 'refresh';
}

const BLOCK_CHECK_SECONDS = 15;
const statusCache = new Map<string, { blocked: boolean; until: number }>();

/** Whether an account is blocked, remembered for a few seconds so busy screens do not hit the database each call. */
async function isBlocked(userId: string): Promise<boolean> {
  const cached = statusCache.get(userId);
  if (cached && cached.until > Date.now()) return cached.blocked;
  const user = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
  const blocked = !user || user.status === 'BLOCKED';
  statusCache.set(userId, { blocked, until: Date.now() + BLOCK_CHECK_SECONDS * 1000 });
  return blocked;
}

/** Forget what was remembered about an account (called when an admin blocks or unblocks it). */
export const forgetAccountStatus = (userId: string) => statusCache.delete(userId);

/** `onRequest` hook: refuses the request unless it carries a valid access token of an account that is not blocked. */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ success: false, error: 'Unauthorized JWT token' });
  }
  const { userId, type } = request.user as TokenPayload;
  if (type === 'refresh') return reply.code(401).send({ success: false, error: 'Unauthorized JWT token' });
  if (await isBlocked(userId)) {
    return reply.code(401).send({ success: false, code: 'ACCOUNT_BLOCKED', error: 'Ce compte est bloqué.' });
  }
}

/** `onRequest` hook for the admin portal: a valid token that belongs to an admin. */
export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const denied = await authenticate(request, reply);
  if (denied) return denied;
  if ((request.user as TokenPayload).role !== 'ADMIN') {
    return reply.code(403).send({ success: false, error: 'Admin access required.' });
  }
}

export const currentUser = (request: FastifyRequest) => request.user as TokenPayload;
