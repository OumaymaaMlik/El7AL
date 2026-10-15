import pino from 'pino';
import type { FastifyBaseLogger } from 'fastify';

/** The one structured (JSON) logger of the server: Fastify uses it for requests, everything else imports it. */
export const logger: FastifyBaseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Never write credentials, whatever is logged.
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash', '*.pushToken'],
});
