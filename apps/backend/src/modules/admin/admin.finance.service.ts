import { db } from '../../config/db.js';
import { AccountStatus, TransactionStatus } from '@el7al/shared';
import { COMMISSION_FEE_TND } from '../../config/business.js';
import { publish } from '../../events/domain-events.js';
import { standingOf } from '../wallet/wallet.standing.js';

/** Receipts waiting, each with what the artisan owes right now so the admin can compare it with the transfer. */
export async function getPendingTopups() {
  const topups = await db.topupTransaction.findMany({
    where: { status: TransactionStatus.PENDING },
    include: { provider: { include: { user: { select: { fullName: true, phoneNumber: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return Promise.all(
    topups.map(async (t) => {
      const { owed, overdue } = await standingOf(t.provider);
      return { ...t, owed, overdue };
    }),
  );
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
export async function approveTopup(id: string, adminUserId: string, received?: number) {
  const transaction = await pendingTopup(id);
  // `received` is what the admin found on the bank account when it differs from the declared amount.
  const credited = received ?? Number(transaction.amount);
  if (!Number.isFinite(credited) || credited <= 0) throw new Error('Le montant reçu doit être positif.');
  const newBalance = Number(transaction.provider.walletBalance) + credited;

  const [updated] = await db.$transaction([
    db.topupTransaction.update({
      where: { id },
      data: { status: TransactionStatus.APPROVED, validatedBy: adminUserId, receivedAmount: credited },
    }),
    db.providerProfile.update({ where: { id: transaction.providerId }, data: { walletBalance: newBalance } }),
  ]);

  if (transaction.provider.user.status === AccountStatus.SUSPENDED_LOW_BALANCE && newBalance >= COMMISSION_FEE_TND) {
    await db.user.update({ where: { id: transaction.provider.userId }, data: { status: AccountStatus.ACTIVE } });
  }
  // What still blocks the artisan after this transfer (a debt due later is not counted).
  const { overdue: remaining } = await standingOf({ id: transaction.providerId, walletBalance: newBalance });
  await publish('topup.decided', { userId: transaction.provider.userId, status: 'APPROVED', remaining });
  return { transaction: updated, newWalletBalance: newBalance };
}

export async function rejectTopup(id: string, adminUserId: string) {
  const transaction = await pendingTopup(id);
  const rejected = await db.topupTransaction.update({
    where: { id },
    data: { status: TransactionStatus.REJECTED, validatedBy: adminUserId },
  });
  await publish('topup.decided', { userId: transaction.provider.userId, status: 'REJECTED', remaining: 0 });
  return rejected;
}

export async function getDisputes() {
  const disputes = await db.dispute.findMany({
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
  // Who reported: the admin needs to know which side is complaining.
  return disputes.map((d) => ({
    ...d,
    reporterRole: d.mission?.client?.userId === d.reporterId ? 'CLIENT' : 'PROVIDER',
  }));
}

export async function resolveDispute(id: string, status: 'RESOLVED' | 'DISMISSED', resolutionNotes?: string) {
  return db.dispute.update({ where: { id }, data: { status, resolutionNotes } });
}
