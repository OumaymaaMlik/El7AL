import { db } from '../../config/db.js';
import { MissionStatus } from '@el7al/shared';
import { publish } from '../../events/domain-events.js';

export async function submitMissionReview(
  missionId: string,
  userId: string,
  rating: number,
  comment?: string,
  amount?: string,
) {
  const clientProfile = await db.clientProfile.findUnique({ where: { userId } });
  if (!clientProfile) throw new Error('Client profile not found');

  const mission = await db.mission.findUnique({
    where: { id: missionId },
    include: { review: true },
  });
  if (!mission || !mission.providerId) throw new Error('Mission or Provider not found');
  if (mission.clientId !== clientProfile.id) throw new Error('Only the client of this mission can review it.');
  if (mission.status !== MissionStatus.COMPLETED)
    throw new Error('La mission doit être terminée avant de laisser un avis.');
  if (mission.review) throw new Error('Vous avez déjà laissé un avis pour cette mission.');

  const review = await db.review.create({
    data: {
      missionId,
      clientId: clientProfile.id,
      providerId: mission.providerId,
      rating,
      comment: comment || null,
    },
  });

  // Recalculate provider rating average
  const allReviews = await db.review.findMany({
    where: { providerId: mission.providerId },
  });
  const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

  await db.providerProfile.update({
    where: { id: mission.providerId },
    data: {
      ratingAverage: Number(avg.toFixed(1)),
      totalRatings: allReviews.length,
    },
  });

  const providerUser = await db.providerProfile.findUnique({
    where: { id: mission.providerId },
    select: { userId: true },
  });
  const clientUser = await db.user.findUnique({ where: { id: userId }, select: { fullName: true } });
  await publish('mission.reviewed', {
    mission: { id: missionId, providerUserId: providerUser?.userId },
    rating,
    comment: comment || '',
    clientName: clientUser?.fullName || 'Client El 7al',
    ratingAverage: Number(avg.toFixed(1)),
    totalRatings: allReviews.length,
    amount,
  });

  return { success: true, review, ratingAverage: Number(avg.toFixed(1)) };
}
