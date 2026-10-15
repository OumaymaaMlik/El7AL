import { db } from '../../config/db.js';
import { issueCode, verifyCode } from '../../services/emailCodes.js';
import { sendEmailVerificationCode } from '../../services/mail.service.js';
import { getUserProfile } from '../auth/auth.service.js';

type Failure = { ok: false; status: number; error: string };

const subjectOf = (userId: string, email: string) => `${userId}:${email}`;
const normalize = (email: string) => email.toLowerCase().trim();

/**
 * Step 1 of an e-mail change: checks the new address is free, then sends a code TO IT.
 * The address on the account does not change until step 2.
 */
export async function requestEmailChange(
  userId: string,
  rawEmail: string,
): Promise<{ ok: true; email: string; devCode?: string } | Failure> {
  const email = normalize(rawEmail);
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true } });
  if (!user) return { ok: false, status: 404, error: 'Compte introuvable.' };
  if (user.email === email) return { ok: false, status: 400, error: 'Cette adresse est déjà la vôtre.' };
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, status: 409, error: 'Cette adresse e-mail est déjà utilisée par un autre compte.' };
  }

  const code = await issueCode('email-change', subjectOf(userId, email), { cooldown: true });
  if (!code)
    return {
      ok: false,
      status: 429,
      error: 'Un code vient d’être envoyé. Patientez une minute avant d’en demander un autre.',
    };
  if (!(await sendEmailVerificationCode(email, code, user.fullName, 'email-change'))) {
    return { ok: false, status: 502, error: "Le code n'a pas pu être envoyé. Réessayez." };
  }
  return { ok: true, email, devCode: process.env.NODE_ENV !== 'production' ? code : undefined };
}

/** Step 2: the right code proves the person reads the new address, and only then the account is updated. */
export async function confirmEmailChange(
  userId: string,
  rawEmail: string,
  code: string,
): Promise<{ ok: true; user: Awaited<ReturnType<typeof getUserProfile>> } | Failure> {
  const email = normalize(rawEmail);
  const result = await verifyCode('email-change', subjectOf(userId, email), code || '');
  if (result === 'locked') return { ok: false, status: 429, error: 'Trop de tentatives. Demandez un nouveau code.' };
  if (result === 'invalid') return { ok: false, status: 400, error: 'Code invalide ou expiré.' };

  try {
    await db.user.update({ where: { id: userId }, data: { email } });
  } catch {
    // The address was taken by someone else between the two steps.
    return { ok: false, status: 409, error: 'Cette adresse e-mail est déjà utilisée par un autre compte.' };
  }
  return { ok: true, user: await getUserProfile(userId) };
}
