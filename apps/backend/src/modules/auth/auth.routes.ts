import type { FastifyInstance, FastifyReply } from 'fastify';
import { registerClient, registerProvider, loginUser, getUserProfile } from './auth.service.js';
import {
  LoginInput,
  RegisterClientInput,
  RegisterProviderInput,
  registerClientSchema,
  registerProviderSchema,
} from './auth.schema.js';
import { consumeEmailVerified, markEmailVerified } from '../../services/emailCodes.js';
import { authenticate, currentUser } from '../../utils/authGuards.js';
import { publish } from '../../events/domain-events.js';
import { endSession, issueSession, rotateSession } from '../../services/sessions.js';

const EMAIL_NOT_VERIFIED = "Veuillez d'abord vérifier votre adresse e-mail.";
const REGISTER_LIMIT = { rateLimit: { max: 5, timeWindow: '10 minutes' } };

const messageOf = (err: unknown) => (err instanceof Error ? err.message : 'Request failed.');

export async function authRoutes(app: FastifyInstance) {
  /**
   * Both registrations work the same way: the address must have been verified with a code just before, the
   * verification is used up by the sign-up, and it is given back if the sign-up fails so the form can be fixed.
   */
  async function register<T extends { email: string }>(
    input: T,
    create: (input: T) => Promise<{ id: string; role: string }>,
    reply: FastifyReply,
  ) {
    const email = input.email.toLowerCase().trim();
    if (!(await consumeEmailVerified(email))) {
      return reply.code(400).send({ success: false, error: EMAIL_NOT_VERIFIED });
    }
    try {
      const user = await create({ ...input, email });
      const session = await issueSession(app, user);
      return reply.code(201).send({ success: true, ...session, user });
    } catch (err) {
      await markEmailVerified(email);
      return reply.code(400).send({ success: false, error: messageOf(err) });
    }
  }

  app.post(
    '/register/client',
    {
      config: REGISTER_LIMIT,
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new Client account',
        body: {
          type: 'object',
          required: ['fullName', 'phoneNumber', 'email', 'password'],
          properties: {
            fullName: { type: 'string', examples: ['Ahmed Ben Ali'] },
            phoneNumber: { type: 'string', examples: ['+21698765432'] },
            email: { type: 'string', format: 'email', examples: ['ahmed@example.com'] },
            password: { type: 'string', minLength: 8, maxLength: 128, examples: ['password123'] },
            defaultAddress: { type: 'string', examples: ['Tunis, Avenue Habib Bourguiba'] },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = registerClientSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ success: false, error: parsed.error.issues[0].message });
      return register<RegisterClientInput>(parsed.data, registerClient, reply);
    },
  );

  app.post(
    '/register/provider',
    {
      config: REGISTER_LIMIT,
      schema: {
        tags: ['Authentication'],
        summary: 'Register a new Service Provider account',
        body: {
          type: 'object',
          required: ['fullName', 'phoneNumber', 'email', 'password', 'categoryIds'],
          properties: {
            fullName: { type: 'string', examples: ['Sami Plombier'] },
            phoneNumber: { type: 'string', examples: ['+21622334455'] },
            email: { type: 'string', format: 'email', examples: ['sami@example.com'] },
            password: { type: 'string', minLength: 8, maxLength: 128, examples: ['password123'] },
            bio: { type: 'string', examples: ["Plombier avec 10 ans d'expérience."] },
            radiusKm: { type: 'number', minimum: 1, maximum: 100, examples: [20] },
            categoryIds: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 20 },
            documentsUrl: { type: 'array', items: { type: 'string', maxLength: 500 }, maxItems: 5 },
            cinNumber: { type: 'string', pattern: '^[0-9]{8}$' },
            cinFrontUrl: { type: 'string', maxLength: 500 },
            cinBackUrl: { type: 'string', maxLength: 500 },
            licenseNumber: { type: 'string', maxLength: 40 },
            vehicleType: { type: 'string', enum: ['CAR', 'VAN', 'MOTO'] },
          },
        },
      },
    },
    async (request, reply) => {
      const parsed = registerProviderSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ success: false, error: parsed.error.issues[0].message });
      return register<RegisterProviderInput>(
        parsed.data,
        async (input) => {
          const user = await registerProvider(input);
          if (user.providerProfile) {
            await publish('provider.registered', {
              providerId: user.providerProfile.id,
              fullName: user.fullName,
              createdAt: user.createdAt,
            });
          }
          return user;
        },
        reply,
      );
    },
  );

  app.post(
    '/login',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Authenticate phone/email + password',
        body: {
          type: 'object',
          required: ['identifier', 'password'],
          properties: {
            identifier: { type: 'string', examples: ['+21698765432'] },
            password: { type: 'string', examples: ['password123'] },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await loginUser(request.body as LoginInput);
        const session = await issueSession(app, user);
        return reply.send({
          success: true,
          ...session,
          user: {
            id: user.id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            role: user.role,
            status: user.status,
            avatarUrl: user.avatarUrl,
          },
        });
      } catch (err) {
        return reply.code(401).send({ success: false, error: messageOf(err) });
      }
    },
  );

  // Trades the long-lived refresh token for a new access token (and a new refresh token: each one works once).
  app.post(
    '/refresh',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['Authentication'],
        summary: 'Renew the access token with a refresh token',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string', maxLength: 2000 } },
        },
      },
    },
    async (request, reply) => {
      const session = await rotateSession(app, (request.body as { refreshToken: string }).refreshToken);
      if (!session) return reply.code(401).send({ success: false, error: 'Session expirée, reconnectez-vous.' });
      return reply.send({ success: true, ...session });
    },
  );

  app.post(
    '/logout',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'End the session: the refresh token stops working',
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string', maxLength: 2000 } },
        },
      },
    },
    async (request, reply) => {
      await endSession(app, (request.body as { refreshToken: string }).refreshToken);
      return reply.send({ success: true });
    },
  );

  app.get(
    '/me',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Get profile of current authenticated user',
        security: [{ bearerAuth: [] }],
      },
      onRequest: [authenticate],
    },
    async (request, reply) => reply.send({ success: true, data: await getUserProfile(currentUser(request).userId) }),
  );
}
