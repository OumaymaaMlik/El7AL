import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../config/db.js';
import { hashPassword } from '../../utils/hash.js';
import { issueCode, verifyCode } from '../../services/emailCodes.js';
import { sendEmailVerificationCode } from '../../services/mail.service.js';

const GENERIC_MESSAGE = "Si un compte correspond, un code de réinitialisation vient d'être envoyé par e-mail.";
const INVALID_CODE_MESSAGE = 'Code invalide ou expiré.';

const forgotSchema = z.object({ identifier: z.string().trim().min(3).max(120) });
const resetSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  code: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/),
  newPassword: z.string().min(8).max(128),
});

/** Finds the account an identifier (email or phone number) refers to. */
async function findUser(identifier: string) {
  const email = identifier.toLowerCase();
  const digits = identifier.replace(/\D/g, '');
  const phoneCandidates = new Set([identifier, digits.length === 8 ? `+216${digits}` : identifier]);
  return db.user.findFirst({
    where: { OR: [{ email }, ...[...phoneCandidates].map((phoneNumber) => ({ phoneNumber }))] },
    select: { id: true, email: true, fullName: true, status: true },
  });
}

export async function passwordResetRoutes(app: FastifyInstance) {
  // 1. Request a reset code. Always answers the same, so it cannot be used to discover accounts.
  app.post(
    '/password/forgot',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Email a password reset code',
        body: {
          type: 'object',
          required: ['identifier'],
          properties: { identifier: { type: 'string', examples: ['ahmed@example.com'] } },
        },
      },
    },
    async (request, reply) => {
      const parsed = forgotSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ success: false, error: 'Identifiant invalide.' });

      const user = await findUser(parsed.data.identifier);
      let devCode: string | undefined;

      if (user?.email && user.status !== 'BLOCKED') {
        const code = await issueCode('reset', user.id, { cooldown: true });
        if (code) {
          const sent = await sendEmailVerificationCode(user.email, code, user.fullName, 'reset');
          if (!sent) request.log.error({ userId: user.id }, 'Failed to send password reset email');
          if (process.env.NODE_ENV !== 'production') devCode = code;
        }
      }

      return reply.send({ success: true, message: GENERIC_MESSAGE, code: devCode });
    },
  );

  // 2. Set a new password with the emailed code.
  app.post(
    '/password/reset',
    {
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Reset the password using the emailed code',
        body: {
          type: 'object',
          required: ['identifier', 'code', 'newPassword'],
          properties: {
            identifier: { type: 'string' },
            code: { type: 'string', examples: ['123456'] },
            newPassword: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = resetSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' });
      }
      const { identifier, code, newPassword } = parsed.data;

      const user = await findUser(identifier);
      if (!user || user.status === 'BLOCKED' || (await verifyCode('reset', user.id, code)) !== 'ok') {
        return reply.code(400).send({ success: false, error: INVALID_CODE_MESSAGE });
      }

      await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });

      return reply.send({ success: true, message: 'Mot de passe réinitialisé.' });
    },
  );
}
