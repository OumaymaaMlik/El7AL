import { db } from '../../config/db.js';
import { publish } from '../../events/domain-events.js';

/** A client or the artisan of a mission reports a problem; only the people of that mission may. */
export async function createDispute(missionId: string, reporterUserId: string, reason: string) {
  const mission = await db.mission.findUnique({
    where: { id: missionId },
    select: {
      client: { select: { userId: true, user: { select: { fullName: true } } } },
      provider: { select: { userId: true, user: { select: { fullName: true } } } },
    },
  });
  const reporter = [mission?.client, mission?.provider].find((p) => p?.userId === reporterUserId);
  if (!reporter) throw new Error('Mission not found');

  const open = await db.dispute.count({ where: { missionId, reporterId: reporterUserId, status: 'OPEN' } });
  if (open > 0) throw new Error('Vous avez déjà signalé cette intervention. El 7al va vous répondre.');

  const dispute = await db.dispute.create({
    data: { missionId, reporterId: reporterUserId, reason: reason.trim(), status: 'OPEN' },
  });
  await publish('dispute.opened', { reporterName: reporter.user.fullName, missionId });
  return dispute;
}
