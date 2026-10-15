import type { FastifyInstance } from 'fastify';
import { updateUserProfile, getUserProfile } from '../auth/auth.service.js';
import { deleteOwnAccount } from './accountDeletion.js';
import { confirmEmailChange, requestEmailChange } from './emailChange.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { respond } from '../../utils/respond.js';

const messageOf = (err: unknown) => (err instanceof Error ? err.message : 'Request failed.');

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    {
      schema: { tags: ['Users'], summary: 'Get profile of current authenticated user', security: [{ bearerAuth: [] }] },
      onRequest: [authenticate],
    },
    async (request, reply) => reply.send({ success: true, data: await getUserProfile(currentUser(request).userId) }),
  );

  app.put(
    '/profile',
    {
      schema: {
        tags: ['Users'],
        summary: 'Update name, photo, address, presentation or password (the e-mail has its own verified flow)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            fullName: { type: 'string', minLength: 2, maxLength: 80 },
            avatarUrl: { type: 'string' },
            defaultAddress: { type: 'string' },
            defaultLat: { type: 'number' },
            defaultLng: { type: 'number' },
            bio: { type: 'string', maxLength: 600 },
            pushToken: { type: 'string', maxLength: 200 },
            oldPassword: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      try {
        const updated = await updateUserProfile(
          currentUser(request).userId,
          request.body as Parameters<typeof updateUserProfile>[1],
        );
        return reply.send({ success: true, data: updated });
      } catch (err) {
        return reply.code(400).send({ success: false, error: messageOf(err) });
      }
    },
  );

  // Changing the e-mail address: a code is sent to the NEW address, and the address changes only once it is typed back.
  app.post(
    '/email/request-change',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Users'],
        summary: 'Send a verification code to a new e-mail address',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email', examples: ['new@example.com'] } },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { email } = request.body as { email: string };
      const result = await requestEmailChange(currentUser(request).userId, email);
      if (!result.ok) return reply.code(result.status).send({ success: false, error: result.error });
      return reply.send({ success: true, message: `Code envoyé à ${result.email}`, code: result.devCode });
    },
  );

  app.post(
    '/email/confirm-change',
    {
      config: { rateLimit: { max: 10, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Users'],
        summary: 'Confirm the new e-mail address with the code received there',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email' },
            code: { type: 'string', examples: ['123456'] },
          },
        },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { email, code } = request.body as { email: string; code: string };
      const result = await confirmEmailChange(currentUser(request).userId, email, code);
      if (!result.ok) return reply.code(result.status).send({ success: false, error: result.error });
      return reply.send({ success: true, data: result.user });
    },
  );

  // Deleting the account: needs the password, and is refused while a job is open (see accountDeletion.ts).
  app.delete(
    '/me',
    {
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['Users'],
        summary: 'Delete my account and erase my personal data',
        security: [{ bearerAuth: [] }],
        body: { type: 'object', required: ['password'], properties: { password: { type: 'string', maxLength: 128 } } },
      },
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const { password } = request.body as { password: string };
      return respond(reply, async () => {
        await deleteOwnAccount(currentUser(request).userId, password);
        return { deleted: true };
      });
    },
  );
}
