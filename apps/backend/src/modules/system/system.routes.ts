import type { FastifyInstance } from 'fastify';
import client from 'prom-client';
import { db } from '../../config/db.js';

/** Monitoring and the public catalogue: metrics, health check, the list of trades. */
export async function systemRoutes(app: FastifyInstance) {
  // 7. Prometheus Metrics Endpoint
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', client.register.contentType);
    return client.register.metrics();
  });

  // 8. Health Check Route
  app.get(
    '/api/v1/health',
    {
      schema: {
        tags: ['Health & System'],
        summary: 'Check API and Database Health Status',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              database: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      let dbStatus = 'disconnected';
      try {
        await db.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
      } catch (e) {
        dbStatus = 'error';
      }

      // A monitor reads the status code: 503 tells it (and a load balancer) the server cannot serve right now.
      if (dbStatus !== 'connected') reply.code(503);
      return {
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbStatus,
      };
    },
  );

  // 9. List Categories Route
  app.get(
    '/api/v1/categories',
    {
      schema: {
        tags: ['Categories'],
        summary: 'Get list of active service categories',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    icon: { type: 'string' },
                    description: { type: 'string' },
                    isActive: { type: 'boolean' },
                    availableProvidersCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => {
      const categories = await db.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              providers: {
                where: {
                  provider: { isAvailable: true },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          description: c.description,
          isActive: c.isActive,
          availableProvidersCount: c._count.providers,
        })),
      };
    },
  );
}
