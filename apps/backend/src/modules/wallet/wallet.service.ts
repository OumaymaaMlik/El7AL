import { db } from '../../config/db.js';
import crypto from 'crypto';
import { TransactionStatus } from '@el7al/shared';

function generateUniqueRef(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EL7AL-REF-${randomHex}`;
}

export async function requestTopup(providerUserId: string, amount: number, receiptPhotoUrl: string) {
  const providerProfile = await db.providerProfile.findUnique({
    where: { userId: providerUserId },
  });

  if (!providerProfile) {
    throw new Error('Provider profile not found');
  }

  const uniqueRef = generateUniqueRef();

  const transaction = await db.topupTransaction.create({
    data: {
      providerId: providerProfile.id,
      uniqueRef,
      amount,
      receiptPhotoUrl,
      status: TransactionStatus.PENDING,
    },
  });

  return transaction;
}

export async function getProviderTransactions(providerUserId: string) {
  const providerProfile = await db.providerProfile.findUnique({
    where: { userId: providerUserId },
  });

  if (!providerProfile) {
    throw new Error('Provider profile not found');
  }

  const transactions = await db.topupTransaction.findMany({
    where: { providerId: providerProfile.id },
    orderBy: { createdAt: 'desc' },
  });

  return {
    walletBalance: providerProfile.walletBalance,
    transactions,
  };
}
