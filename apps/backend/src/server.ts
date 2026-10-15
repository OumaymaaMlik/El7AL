import { registerNotificationListeners } from './modules/notifications/notification.listener.js';
import fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import client from 'prom-client';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { passwordResetRoutes } from './modules/auth/password-reset.js';
import { emailVerificationRoutes } from './modules/auth/emailVerification.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';
import { geoRoutes } from './modules/geo/geo.routes.js';
import { missionRoutes } from './modules/mission/mission.routes.js';
import { walletRoutes } from './modules/wallet/wallet.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { systemRoutes } from './modules/system/system.routes.js';
import { disputeRoutes } from './modules/dispute/dispute.routes.js';
import rateLimit from '@fastify/rate-limit';
import { stripSecrets } from './utils/sanitize.js';
import { signPrivateUrls } from './services/storage.service.js';
import { verifyAccessToken } from './services/sessions.js';
import { allowedOrigins, assertProductionConfig, getJwtSecret } from './config/security.js';
import { closeSocketGateway, initSocketGateway } from './websockets/socket.gateway.js';
import { closeMissionQueue } from './queues/mission.queue.js';
import { redis } from './services/redis.service.js';
import { logger } from './utils/logger.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

// Register Prometheus default metrics
client.collectDefaultMetrics({ prefix: 'el7al_' });

export async function buildServer() {
  // Who is told what (real-time events and push) lives in one module, fed by domain events.
  registerNotificationListeners();

  const app = fastify({
    loggerInstance: logger,
    // Behind a reverse proxy the real client IP (needed by rate limiting) is in X-Forwarded-For.
    trustProxy: process.env.TRUST_PROXY === 'true',
    ajv: {
      customOptions: {
        keywords: ['example'],
        strict: false,
      },
    },
  });

  // Never serialize credentials, whatever a handler returns.
  app.addHook('preSerialization', async (request, _reply, payload) => {
    const safe = stripSecrets(payload);
    // Only admins reach identity documents and receipts, as short-lived signed links.
    return request.url.startsWith('/api/v1/admin') ? signPrivateUrls(safe) : safe;
  });

  // Global request budget per client IP; sensitive routes set stricter limits of their own.
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    allowList: (request) => request.url.startsWith('/metrics') || request.url.startsWith('/docs'),
  });

  // 1. Register CORS
  await app.register(cors, {
    origin: allowedOrigins(),
    // The plugin only allows GET, HEAD and POST by default, which blocks every browser PUT, PATCH and DELETE.
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // 2. Register Multipart File Upload Plugin
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // 3. Register JWT
  await app.register(fastifyJwt, {
    secret: getJwtSecret(),
  });

  // 4. Register Swagger OpenAPI Generator
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Solution El 7al API Documentation',
        description: 'RESTful API & Real-time WebSockets documentation for Solution El 7al platform.',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Local Development Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Health & System', description: 'System status & Prometheus metrics endpoints' },
        { name: 'Authentication', description: 'User login, registration & profile' },
        { name: 'File Uploads', description: 'MinIO S3 photo & document uploads' },
        { name: 'Wallet & Commissions', description: 'Provider prepaid balance, 30 TND commission & top-ups' },
        { name: 'Admin & Supervision', description: 'Document verification, wire reconciliation & fleet map' },
        { name: 'Geospatial & Availability', description: 'Redis Geo location & provider availability' },
        { name: 'Missions', description: 'Service request dispatch, atomic matching & status' },
        { name: 'Reviews & Disputes', description: 'Ratings, reviews and dispute resolutions' },
        { name: 'Categories', description: 'Service category management' },
      ],
    },
  });

  // 5. Register Swagger UI Playground at /docs
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // 6. Register Domain Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(emailVerificationRoutes, { prefix: '/api/v1/auth' });
  await app.register(passwordResetRoutes, { prefix: '/api/v1/auth' });
  await app.register(userRoutes, { prefix: '/api/v1/users' });
  await app.register(uploadRoutes, { prefix: '/api/v1/uploads' });
  await app.register(geoRoutes, { prefix: '/api/v1/geo' });
  await app.register(missionRoutes, { prefix: '/api/v1/missions' });
  await app.register(walletRoutes, { prefix: '/api/v1/wallet' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });
  await app.register(disputeRoutes, { prefix: '/api/v1' });

  await app.register(systemRoutes);

  // Whatever fails inside a handler, the person gets a clean message, never a stack trace or an internal detail.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const status = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    if (status >= 500) request.log.error({ err: error }, 'Unhandled error');
    return reply.code(status).send({
      success: false,
      error: status >= 500 ? 'Erreur interne du serveur. Réessayez dans un instant.' : error.message,
    });
  });
  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ success: false, error: 'Route not found' }));

  return app;
}

/**
 * On a stop signal (a deploy, a restart): stop taking new requests, let the running ones finish, close the live
 * connections, the queue and the databases, then exit. A stuck shutdown is forced after 15 seconds.
 */
function handleShutdown(app: FastifyInstance) {
  let stopping = false;
  const stop = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, 'Shutting down');
    setTimeout(() => process.exit(1), 15000).unref();
    try {
      await closeSocketGateway();
      await app.close();
      await closeMissionQueue();
      await db.$disconnect();
      redis.disconnect();
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Shutdown failed');
      process.exit(1);
    }
  };
  process.once('SIGTERM', () => void stop('SIGTERM'));
  process.once('SIGINT', () => void stop('SIGINT'));
}

async function start() {
  try {
    assertProductionConfig();
    const app = await buildServer();
    await app.listen({ port: PORT, host: HOST });

    // Initialize Socket.io Server attached to HTTP server
    initSocketGateway(app.server, verifyAccessToken(app));

    logger.info({ port: PORT }, 'El 7al API server is running (sockets, /metrics and /docs on the same port)');
    handleShutdown(app);
  } catch (err) {
    logger.error({ err }, 'Error starting server');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
