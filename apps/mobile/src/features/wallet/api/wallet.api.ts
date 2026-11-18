import { z } from 'zod';
import { api } from '../../../services/http/client';

const transactionSchema = z
  .object({
    id: z.string(),
    amount: z.any(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    createdAt: z.string().nullish(),
  })
  .passthrough();

const walletSchema = z.object({
  walletBalance: z.any(),
  transactions: z.array(transactionSchema),
});

export type TopupTransaction = z.infer<typeof transactionSchema>;
export type Wallet = z.infer<typeof walletSchema>;

/** The artisan's wallet balance and their bank-transfer top-ups, newest first. */
export async function fetchWallet(): Promise<Wallet> {
  const res = await api.get('/wallet/transactions');
  return walletSchema.parse(res.data?.data ?? res.data);
}

/** Sends a transfer receipt (a hosted photo URL) with the amount, for an admin to check. */
export async function submitTopup(amount: number, receiptPhotoUrl: string): Promise<void> {
  await api.post('/wallet/topup', { amount, receiptPhotoUrl });
}
