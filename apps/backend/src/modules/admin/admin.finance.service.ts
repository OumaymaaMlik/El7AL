import { db } from '../../config/db.js';
import { AccountStatus, TransactionStatus } from '@el7al/shared';
import { COMMISSION_FEE_TND } from '../../config/business.js';

export async function getPendingTopups() {
  return db.topupTransaction.findMany({
    where: { status: TransactionStatus.PENDING },
    include: { provider: { include: { user: { select: { fullName: true, phoneNumber: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function pendingTopup(id: string) {
  const transaction = await db.topupTransaction.findUnique({
    where: { id },
    include: { provider: { include: { user: true } } },
  });
  if (!transaction || transaction.status !== TransactionStatus.PENDING) {
    throw new Error('Invalid or non-pending top-up transaction');
  }
  return transaction;
}

/** Credits the artisan's wallet with a validated bank transfer, and reactivates an account suspended for low balance. */
export async function approveTopup(id: string, adminUserId: string) {
  const transaction = await pendingTopup(id);
  const newBalance = Number(transaction.provider.walletBalance) + Number(transaction.amount);

  const [updated] = await db.$transaction([
    db.topupTransaction.update({
      where: { id },
      data: { status: TransactionStatus.APPROVED, validatedBy: adminUserId },
    }),
    db.providerProfile.update({ where: { id: transaction.providerId }, data: { walletBalance: newBalance } }),
  ]);

  if (transaction.provider.user.status === AccountStatus.SUSPENDED_LOW_BALANCE && newBalance >= COMMISSION_FEE_TND) {
    await db.user.update({ where: { id: transaction.provider.userId }, data: { status: AccountStatus.ACTIVE } });
  }
  return { transaction: updated, newWalletBalance: newBalance };
}

export async function rejectTopup(id: string, adminUserId: string) {
  await pendingTopup(id);
  return db.topupTransaction.update({
    where: { id },
    data: { status: TransactionStatus.REJECTED, validatedBy: adminUserId },
  });
}

export async function getDisputes() {
  return db.dispute.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      mission: {
        include: {
          client: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
          provider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
        },
      },
    },
  });
}

export async function resolveDispute(id: string, status: 'RESOLVED' | 'DISMISSED', resolutionNotes?: string) {
  return db.dispute.update({ where: { id }, data: { status, resolutionNotes } });
}
