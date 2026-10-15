import { Queue, Worker } from 'bullmq';
import { redis } from '../services/redis.service.js';
import { db } from '../config/db.js';
import { MissionStatus } from '@el7al/shared';
import { publish } from '../events/domain-events.js';
import { logger } from '../utils/logger.js';

const MISSION_TIMEOUT_QUEUE = 'mission-timeout-queue';

const missionTimeoutQueue = new Queue(MISSION_TIMEOUT_QUEUE, {
  connection: redis,
});

/**
 * Schedule a 90-second expiration check for a newly broadcasted mission request
 */
export async function scheduleMissionTimeout(missionId: string, delayMs = 90000) {
  await missionTimeoutQueue.add(
    'check-timeout',
    { missionId },
    { delay: delayMs, jobId: `mission-timeout-${missionId}` },
  );
  logger.info(`Scheduled 90s timeout check for mission: ${missionId}`);
}

/**
 * BullMQ Worker handling mission expirations
 */
const missionWorker = new Worker(
  MISSION_TIMEOUT_QUEUE,
  async (job) => {
    const { missionId } = job.data as { missionId: string };
    const mission = await db.mission.findUnique({
      where: { id: missionId },
      include: { client: { select: { userId: true } } },
    });

    if (mission && (mission.status === MissionStatus.CREATED || mission.status === MissionStatus.BROADCASTED)) {
      const reason = 'Expired: No provider accepted the request within 90 seconds.';
      await db.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED, cancellationReason: reason },
      });
      // The client hears it, and the artisans who were shown the offer see it withdrawn.
      await publish('mission.cancelled', {
        mission: { id: mission.id, clientUserId: mission.client.userId, providerUserId: null },
        reason,
        wasAccepted: false,
        cancelledBy: 'SYSTEM',
      });
    }
  },
  { connection: redis },
);

missionWorker.on('completed', (job) => {
  logger.info(`Mission timeout job ${job.id} completed.`);
});

missionWorker.on('failed', (job, err) => {
  logger.error({ err }, `Mission timeout job ${job?.id} failed`);
});

/** Stops the worker and closes the queue (used when the server shuts down). */
export async function closeMissionQueue(): Promise<void> {
  await missionWorker.close();
  await missionTimeoutQueue.close();
}
