import { db } from '../../config/db.js';
import crypto from 'crypto';
import { TransactionStatus } from '@el7al/shared';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND, owesCommission } from '../../config/business.js';

function generateUniqueRef(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EL7AL-REF-${randomHex}`;
}

async function profileOf(providerUserId: string) {
  const profile = await db.providerProfile.findUnique({ where: { userId: providerUserId } });
  if (!profile) throw new Error('Provider profile not found');
  return profile;
}

/** A transfer receipt from the artisan, for an admin to check against the bank account. One at a time. */
export async function requestTopup(providerUserId: string, amount: number, receiptPhotoUrl: string) {
  const profile = await profileOf(providerUserId);

  const waiting = await db.topupTransaction.count({
    where: { providerId: profile.id, status: TransactionStatus.PENDING },
  });
  if (waiting > 0) throw new Error('Un virement est déjà en cours de vérification.');

  return db.topupTransaction.create({
    data: {
      providerId: profile.id,
      uniqueRef: generateUniqueRef(),
      amount,
      receiptPhotoUrl,
      status: TransactionStatus.PENDING,
    },
  });
}

export async function getProviderTransactions(providerUserId: string) {
  const profile = await profileOf(providerUserId);
  const transactions = await db.topupTransaction.findMany({
    where: { providerId: profile.id },
    orderBy: { createdAt: 'desc' },
  });

  return {
    walletBalance: profile.walletBalance,
    transactions,
    // What the app shows: whether the artisan is stopped by a debt, and how much to transfer.
    blocked: owesCommission(profile),
    due: Math.max(0, -Number(profile.walletBalance)),
    activationFee: ACTIVATION_FEE_TND,
    commissionFee: COMMISSION_FEE_TND,
  };
}
