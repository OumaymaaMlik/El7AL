import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { kv } from './kvStore.js';

/**
 * The 6-digit codes sent by e-mail, for every flow that needs proof of an address:
 *  - signup:       the address of a new account (the subject is the address);
 *  - reset:        a forgotten password (the subject is the account id);
 *  - email-change: a new address for an existing account (the subject is "accountId:newAddress").
 * Codes are stored hashed, expire after 10 minutes, accept 5 attempts, and work once.
 */
export type CodePurpose = 'signup' | 'reset' | 'email-change';

const CODE_TTL_SECONDS = 600;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
/** A verified address can be used to register for 30 minutes. */
const VERIFIED_TTL_SECONDS = 1800;

const key = (purpose: CodePurpose, subject: string, part: 'code' | 'attempts' | 'cooldown') =>
  `emailcode:${purpose}:${part}:${subject}`;
const hash = (code: string) => createHash('sha256').update(code).digest();

export const newCode = (): string => String(randomInt(100000, 1000000));

/**
 * Creates and stores a code. With `cooldown`, returns null while the previous one was issued less than a minute
 * ago, so a code cannot be requested in a loop.
 */
export async function issueCode(
  purpose: CodePurpose,
  subject: string,
  options: { cooldown?: boolean } = {},
): Promise<string | null> {
  if (options.cooldown && (await kv.exists(key(purpose, subject, 'cooldown')))) return null;
  const code = newCode();
  await kv.set(key(purpose, subject, 'code'), hash(code).toString('hex'), CODE_TTL_SECONDS);
  await kv.del(key(purpose, subject, 'attempts'));
  if (options.cooldown) await kv.set(key(purpose, subject, 'cooldown'), '1', RESEND_COOLDOWN_SECONDS);
  return code;
}

export type CodeCheck = 'ok' | 'invalid' | 'locked';

/** Checks a submitted code. Every call counts as an attempt; too many burn the code ('locked'). */
export async function verifyCode(purpose: CodePurpose, subject: string, submitted: string): Promise<CodeCheck> {
  const attemptsKey = key(purpose, subject, 'attempts');
  const attempts = await kv.incr(attemptsKey, CODE_TTL_SECONDS);
  if (attempts > MAX_ATTEMPTS) {
    await kv.del(key(purpose, subject, 'code'));
    return 'locked';
  }

  const stored = await kv.get(key(purpose, subject, 'code'));
  if (!stored) return 'invalid';
  const expected = Buffer.from(stored, 'hex');
  const given = hash(submitted.trim());
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid';

  await kv.del(key(purpose, subject, 'code'), attemptsKey);
  return 'ok';
}

const verifiedKey = (email: string) => `emailcode:verified:${email}`;

/** Remembers that `email` proved ownership with a correct signup code. */
export async function markEmailVerified(email: string): Promise<void> {
  await kv.set(verifiedKey(email), '1', VERIFIED_TTL_SECONDS);
}

/** True once per verification: registration consumes it so one code cannot create several accounts. */
export async function consumeEmailVerified(email: string): Promise<boolean> {
  return (await kv.del(verifiedKey(email))) > 0;
}
