import { db } from '../../config/db.js';

/** A client or the artisan of a mission reports a problem; only the people of that mission may. */
export async function createDispute(missionId: string, reporterUserId: string, reason: string) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    select: { client: { select: { userId: true } }, provider: { select: { userId: true } } },
  });
  const involved =
    mission && (mission.client?.userId === reporterUserId || mission.provider?.userId === reporterUserId);
  if (!involved) throw new Error('Mission not found');

  return db.dispute.create({ data: { missionId, reporterId: reporterUserId, reason: reason.trim(), status: 'OPEN' } });
}
