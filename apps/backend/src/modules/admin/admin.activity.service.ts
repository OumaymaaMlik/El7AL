import type { Prisma } from '@prisma/client';
import { db } from '../../config/db.js';
import { AccountStatus, MissionStatus, TransactionStatus, UserRole } from '@el7al/shared';
import { COMMISSION_FEE_TND } from '../../config/business.js';

const PERSON = { select: { id: true, fullName: true, phoneNumber: true, email: true } };
const WITH_PEOPLE = {
  client: { include: { user: PERSON } },
  provider: { include: { user: PERSON } },
  category: true,
  review: true,
  disputes: true,
} satisfies Prisma.MissionInclude;

/** Minutes between the start and the end of a job (at least 1), or null while it is not finished. */
function durationOf(m: { startedAt: Date | null; completedAt: Date | null }): number | null {
  if (!m.startedAt || !m.completedAt) return null;
  return Math.max(1, Math.round((m.completedAt.getTime() - m.startedAt.getTime()) / 60000));
}

const withDuration = <T extends { startedAt: Date | null; completedAt: Date | null }>(missions: T[]) =>
  missions.map((m) => ({ ...m, durationMinutes: durationOf(m) }));

/** Every intervention of the platform, newest first, with who did it and how long it took. */
export async function getAllMissions(status?: string) {
  const missions = await db.mission.findMany({
    where: status && status !== 'ALL' ? { status: status as MissionStatus } : {},
    orderBy: { createdAt: 'desc' },
    include: WITH_PEOPLE,
  });
  return withDuration(missions);
}

/** The interventions of one account, as a client or as an artisan. */
export async function getUserMissions(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { clientProfile: { select: { id: true } }, providerProfile: { select: { id: true } } },
  });
  const owners: Prisma.MissionWhereInput[] = [];
  if (user?.clientProfile) owners.push({ clientId: user.clientProfile.id });
  if (user?.providerProfile) owners.push({ providerId: user.providerProfile.id });
  if (owners.length === 0) return [];

  const missions = await db.mission.findMany({
    where: { OR: owners },
    orderBy: { createdAt: 'desc' },
    include: WITH_PEOPLE,
  });
  return withDuration(missions);
}

/** Revenue of the completed missions finished since `since` (all time when omitted): each one counts its fixed fee. */
async function revenueSince(since?: Date): Promise<number> {
  const where = { status: MissionStatus.COMPLETED, ...(since ? { completedAt: { gte: since } } : {}) };
  const [count, sum] = await Promise.all([
    db.mission.count({ where }),
    db.mission.aggregate({ where, _sum: { commissionFee: true } }),
  ]);
  return Number(sum._sum.commissionFee ?? count * COMMISSION_FEE_TND);
}

const startOfDay = (daysAgo = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
};

/**
 * The figures of the admin home. An intervention that both the artisan and the client confirmed, with no
 * cancellation, is COMPLETED and counts as one fixed fee of revenue.
 */
export async function getPlatformStats() {
  const [completed, revenue, revenueToday, revenueWeek, revenueMonth, users, pendingWireTransfers, openDisputes] =
    await Promise.all([
      db.mission.count({ where: { status: MissionStatus.COMPLETED } }),
      revenueSince(),
      revenueSince(startOfDay()),
      revenueSince(startOfDay(6)),
      revenueSince(startOfDay(29)),
      db.user.groupBy({ by: ['role', 'status'], _count: { _all: true } }),
      db.topupTransaction.count({ where: { status: TransactionStatus.PENDING } }),
      db.dispute.count({ where: { status: 'OPEN' } }),
    ]);

  const count = (role: UserRole, status?: AccountStatus) =>
    users.filter((u) => u.role === role && (!status || u.status === status)).reduce((sum, u) => sum + u._count._all, 0);

  return {
    totalCompletedMissions: completed,
    totalCommissionsCollectedTND: revenue,
    revenueTodayTND: revenueToday,
    revenueWeekTND: revenueWeek,
    revenueMonthTND: revenueMonth,
    pendingVerifications: count(UserRole.PROVIDER, AccountStatus.PENDING_VERIFICATION),
    activeProviders: count(UserRole.PROVIDER, AccountStatus.ACTIVE),
    activeClients: count(UserRole.CLIENT, AccountStatus.ACTIVE),
    totalProviders: count(UserRole.PROVIDER),
    totalClients: count(UserRole.CLIENT),
    pendingWireTransfers,
    totalDisputes: openDisputes,
  };
}
