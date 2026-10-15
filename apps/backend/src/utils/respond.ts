import type { FastifyReply } from 'fastify';

export const messageOf = (err: unknown): string => (err instanceof Error ? err.message : 'Request failed.');

/**
 * Runs the work of a route and answers in the platform's usual shape:
 * `{ success: true, data }` with status `ok` (200), or `{ success: false, error }` with status `fail` (400).
 */
export async function respond(
  reply: FastifyReply,
  work: () => Promise<unknown>,
  options: { ok?: number; fail?: number; message?: string } = {},
) {
  try {
    const data = await work();
    return reply.code(options.ok ?? 200).send({ success: true, message: options.message, data });
  } catch (err) {
    return reply.code(options.fail ?? 400).send({ success: false, error: messageOf(err) });
  }
}
