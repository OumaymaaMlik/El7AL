import { z } from 'zod';
import { api } from '../../../services/http/client';

const transactionSchema = z
  .object({
    id: z.string(),
    amount: z.any(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    createdAt: z.string().nullish(),
    /** What the admin found on the bank account. */
    receivedAmount: z.any().optional(),
  })
  .passthrough();

const chargeSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  commission: z.number(),
  activation: z.number(),
  categoryName: z.string().nullish(),
});

const walletSchema = z.object({
  walletBalance: z.any(),
  transactions: z.array(transactionSchema),
  /** What each finished job cost. */
  charges: z.array(chargeSchema).nullish(),
  /** Blocked only by an overdue amount; `dueLater` is this week's commission, due at `nextDueAt`. */
  blocked: z.boolean().nullish(),
  dueLater: z.number().nullish(),
  nextDueAt: z.string().nullish(),
  jobsDueLater: z.number().nullish(),
  /** The cash collected from clients since Monday, and the jobs finished in that time. */
  earnedThisWeek: z.number().nullish(),
  jobsThisWeek: z.number().nullish(),
  /** Whether the current fees were accepted (kept by the server). */
  termsAccepted: z.boolean().nullish(),
  /** What the artisan owes now (the commission, plus once the activation fee). */
  due: z.number().nullish(),
  /** El 7al's bank account, from the server. */
  rib: z.string().nullish(),
});

export type TopupTransaction = z.infer<typeof transactionSchema>;
export type WalletCharge = z.infer<typeof chargeSchema>;
export type Wallet = z.infer<typeof walletSchema>;

/** The artisan's wallet balance and their bank-transfer top-ups, newest first. */
export async function fetchWallet(): Promise<Wallet> {
  const res = await api.get('/wallet/transactions');
  return walletSchema.parse(res.data?.data ?? res.data);
}

/** Sends a transfer receipt (a hosted photo URL) for an admin to check. The server sets the amount: what is owed. */
export async function submitTopup(receiptPhotoUrl: string): Promise<void> {
  await api.post('/wallet/topup', { receiptPhotoUrl });
}

/** The artisan accepts the fees; the server keeps the date as proof. */
export async function acceptTerms(): Promise<void> {
  await api.post('/wallet/accept-terms', {});
}
