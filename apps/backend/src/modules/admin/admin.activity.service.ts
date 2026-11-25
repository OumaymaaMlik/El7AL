import type { Prisma } from '@prisma/client';
import { db } from '../../config/db.js';
import { AccountStatus, MissionStatus, TransactionStatus, UserRole } from '@el7al/shared';

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

/** Money really received: confirmed bank transfers since `since` (all time when omitted). */
async function receivedSince(since?: Date): Promise<number> {
  const rows = await db.topupTransaction.findMany({
    where: { status: TransactionStatus.APPROVED, ...(since ? { updatedAt: { gte: since } } : {}) },
    select: { amount: true, receivedAmount: true },
  });
  return rows.reduce((sum, r) => sum + Number(r.receivedAmount ?? r.amount), 0);
}

/** What artisans were charged for finished jobs, and what they still owe today. */
async function billedAndUnpaid() {
  const [billed, debts] = await Promise.all([
    db.walletCharge.aggregate({ _sum: { commission: true, activation: true } }),
    db.providerProfile.aggregate({ where: { walletBalance: { lt: 0 } }, _sum: { walletBalance: true } }),
  ]);
  const activation = Number(billed._sum.activation ?? 0);
  return {
    billedTotalTND: Number(billed._sum.commission ?? 0) + activation,
    activationBilledTND: activation,
    unpaidTotalTND: Math.abs(Number(debts._sum.walletBalance ?? 0)),
  };
}

const startOfDay = (daysAgo = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
};

/** The figures of the admin home. Money is shown three ways: billed for finished jobs, received, and still unpaid. */
export async function getPlatformStats() {
  const [completed, users, pendingWireTransfers, openDisputes] = await Promise.all([
    db.mission.count({ where: { status: MissionStatus.COMPLETED } }),
    db.user.groupBy({ by: ['role', 'status'], _count: { _all: true } }),
    db.topupTransaction.count({ where: { status: TransactionStatus.PENDING } }),
    db.dispute.count({ where: { status: 'OPEN' } }),
  ]);
  const [money, received, receivedToday, receivedWeek, receivedMonth] = await Promise.all([
    billedAndUnpaid(),
    receivedSince(),
    receivedSince(startOfDay()),
    receivedSince(startOfDay(6)),
    receivedSince(startOfDay(29)),
  ]);

  const count = (role: UserRole, status?: AccountStatus) =>
    users.filter((u) => u.role === role && (!status || u.status === status)).reduce((sum, u) => sum + u._count._all, 0);

  return {
    totalCompletedMissions: completed,
    ...money,
    receivedTotalTND: received,
    receivedTodayTND: receivedToday,
    receivedWeekTND: receivedWeek,
    receivedMonthTND: receivedMonth,
    pendingVerifications: count(UserRole.PROVIDER, AccountStatus.PENDING_VERIFICATION),
    activeProviders: count(UserRole.PROVIDER, AccountStatus.ACTIVE),
    activeClients: count(UserRole.CLIENT, AccountStatus.ACTIVE),
    totalProviders: count(UserRole.PROVIDER),
    totalClients: count(UserRole.CLIENT),
    pendingWireTransfers,
    totalDisputes: openDisputes,
  };
}
