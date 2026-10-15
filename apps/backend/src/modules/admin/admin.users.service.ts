import type { Prisma } from '@prisma/client';
import { db } from '../../config/db.js';
import { AccountStatus, UserRole } from '@el7al/shared';
import { publish } from '../../events/domain-events.js';
import { removeProviderGeoLocation } from '../../services/redis.service.js';
import { forgetAccountStatus } from '../../utils/authGuards.js';
import { getIO } from '../../websockets/socket.gateway.js';

/** Users with their profile, and how many disputes each artisan is part of. */
export async function getAllUsers(query?: string, role?: string, status?: string) {
  const where: Prisma.UserWhereInput = {};
  if (role && role !== 'ALL') where.role = role as UserRole;
  if (status) where.status = status as AccountStatus;
  if (query) {
    where.OR = [
      { fullName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phoneNumber: { contains: query, mode: 'insensitive' } },
    ];
  }

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      clientProfile: { select: { id: true, defaultAddress: true, _count: { select: { missions: true } } } },
      providerProfile: {
        select: {
          id: true,
          bio: true,
          walletBalance: true,
          ratingAverage: true,
          totalRatings: true,
          isAvailable: true,
          documentsUrl: true,
          categories: { include: { category: true } },
          _count: { select: { acceptedMissions: true } },
        },
      },
    },
  });

  // One query for all disputes, grouped by artisan, instead of one query per user.
  const grouped = await db.dispute.groupBy({
    by: ['missionId'],
    _count: { _all: true },
  });
  const missionOwners = await db.mission.findMany({
    where: { id: { in: grouped.map((g) => g.missionId) }, providerId: { not: null } },
    select: { id: true, providerId: true },
  });
  const disputesByProvider = new Map<string, number>();
  for (const owner of missionOwners) {
    const count = grouped.find((g) => g.missionId === owner.id)?._count._all ?? 0;
    disputesByProvider.set(owner.providerId!, (disputesByProvider.get(owner.providerId!) ?? 0) + count);
  }

  return users.map((u) => ({
    ...u,
    missionsCount: u.clientProfile?._count.missions ?? u.providerProfile?._count.acceptedMissions ?? 0,
    disputesCount: u.providerProfile ? (disputesByProvider.get(u.providerProfile.id) ?? 0) : 0,
  }));
}

async function assertNotAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) throw new Error('User not found');
  if (user.role === UserRole.ADMIN) throw new Error('Un compte administrateur ne peut pas être modifié ici.');
}

export async function updateUserStatus(userId: string, status: AccountStatus) {
  await assertNotAdmin(userId);
  const user = await db.user.update({ where: { id: userId }, data: { status } });
  forgetAccountStatus(userId);
  if (status === AccountStatus.BLOCKED) {
    // A blocked person is cut off at once, including live connections.
    try {
      getIO().in(`user_${userId}`).disconnectSockets(true);
    } catch {
      // Sockets are not running (scripts): nothing to disconnect.
    }
  }
  return user;
}

export async function deleteUser(userId: string) {
  await assertNotAdmin(userId);
  return db.user.delete({ where: { id: userId } });
}

/** Artisans waiting for an admin decision, with their documents. */
export async function getPendingProviders() {
  return db.providerProfile.findMany({
    where: { user: { status: AccountStatus.PENDING_VERIFICATION } },
    include: {
      user: { select: { id: true, fullName: true, phoneNumber: true, email: true, createdAt: true } },
      categories: { include: { category: true } },
    },
  });
}

/**
 * An admin decides about an artisan's identity documents. Approving activates the account; refusing blocks it.
 * A reason is optional: when given, the artisan sees it. The artisan is told at once (real-time event and phone push).
 */
export async function verifyProvider(providerProfileId: string, approve: boolean, notes?: string) {
  const provider = await db.providerProfile.findUnique({ where: { id: providerProfileId }, include: { user: true } });
  if (!provider) throw new Error('Provider not found');

  const reason = notes?.trim() ?? '';

  const newStatus = approve ? AccountStatus.ACTIVE : AccountStatus.REJECTED;
  const [updatedUser] = await db.$transaction([
    db.user.update({ where: { id: provider.userId }, data: { status: newStatus } }),
    db.providerProfile.update({
      where: { id: provider.id },
      data: approve
        ? { verificationNote: null, verifiedAt: new Date() }
        : // A refused artisan must not stay on the map or receive offers.
          { verificationNote: reason || null, verifiedAt: null, isAvailable: false },
    }),
  ]);
  if (!approve) await removeProviderGeoLocation(provider.id);

  const note = approve ? null : reason || null;
  await publish('provider.verified', { userId: provider.userId, status: newStatus, note });
  return { user: updatedUser, notes: note };
}
