import { FastifyInstance } from 'fastify';
import { sendEmailVerificationCode } from '../../services/mail.service.js';
import { issueCode, markEmailVerified, verifyCode } from '../../services/emailCodes.js';

const normalize = (email: string) => (email || '').toLowerCase().trim();

/** The e-mail proof asked before a sign-up: a code is sent, and the right code lets the address register once. */
export async function emailVerificationRoutes(app: FastifyInstance) {
  app.post(
    '/email/send-verification',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Send a 6-digit verification code to an e-mail address',
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', examples: ['ahmed@example.com'] },
            fullName: { type: 'string', examples: ['Ahmed Ben Ali'] },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, fullName } = request.body as { email: string; fullName?: string };
      const address = normalize(email);
      if (!address) return reply.code(400).send({ success: false, error: 'Email address is required.' });

      const code = await issueCode('signup', address);
      const sent = code !== null && (await sendEmailVerificationCode(address, code, fullName));
      return reply.send({
        success: sent,
        message: sent ? `Verification code sent to ${address}` : 'Failed to dispatch verification email',
        code: process.env.NODE_ENV !== 'production' ? code : undefined,
      });
    },
  );

  app.post(
    '/email/verify',
    {
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Verify the 6-digit code received by e-mail',
        body: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email', examples: ['ahmed@example.com'] },
            code: { type: 'string', examples: ['123456'] },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, code } = request.body as { email: string; code: string };
      const address = normalize(email);

      const result = await verifyCode('signup', address, code || '');
      if (result === 'locked') {
        return reply.code(429).send({ success: false, error: 'Trop de tentatives. Demandez un nouveau code.' });
      }
      if (result === 'invalid') {
        return reply.code(400).send({ success: false, error: 'Code de vérification invalide ou expiré.' });
      }
      await markEmailVerified(address);
      return reply.send({ success: true, message: 'Email address verified successfully.' });
    },
  );
}
