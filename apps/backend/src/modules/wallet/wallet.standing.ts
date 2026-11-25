import type { Prisma } from '@prisma/client';
import { db } from '../../config/db.js';

/** Where an artisan stands with El 7al. Amounts in TND. */
export interface Standing {
  /** Everything not paid yet. */
  owed: number;
  /** The part whose payment date has passed: above 0 the artisan is blocked. */
  overdue: number;
  /** The part to pay later (this week's jobs). */
  dueLater: number;
  /** When the part to pay later is due (null when there is none). */
  nextDueAt: Date | null;
  /** How many jobs make up the part to pay later. */
  jobsDueLater: number;
}

type Wallet = { id: string; walletBalance: unknown };
type Client = Prisma.TransactionClient | typeof db;

const owedBy = (wallet: Wallet) => Math.max(0, -Number(wallet.walletBalance));

/**
 * Payments settle the oldest charges first, so what is still owed is the newest charges. The part that is not due yet
 * is therefore the charges with a future date (never more than what is owed); the rest of the debt is overdue.
 */
export async function standingOf(wallet: Wallet, client: Client = db, now = new Date()): Promise<Standing> {
  const owed = owedBy(wallet);
  if (owed === 0) return { owed, overdue: 0, dueLater: 0, nextDueAt: null, jobsDueLater: 0 };

  const later = await client.walletCharge.findMany({
    where: { providerId: wallet.id, dueAt: { gt: now } },
    orderBy: { createdAt: 'desc' },
    select: { commission: true, activation: true, dueAt: true },
  });

  // What is still unpaid are the newest charges: walk from the newest until the debt is covered. A job of this week
  // that was already paid early is not reached, so it is neither counted nor dated.
  const unpaid: Date[] = [];
  let dueLater = 0;
  for (const charge of later) {
    if (dueLater >= owed) break;
    dueLater = Math.min(owed, dueLater + Number(charge.commission) + Number(charge.activation));
    unpaid.push(charge.dueAt);
  }
  const nextDueAt = unpaid.length > 0 ? new Date(Math.min(...unpaid.map((d) => d.getTime()))) : null;
  return { owed, overdue: owed - dueLater, dueLater, nextDueAt, jobsDueLater: unpaid.length };
}

/** An artisan is stopped only by an overdue amount. */
export async function isBlocked(wallet: Wallet, client: Client = db): Promise<boolean> {
  return (await standingOf(wallet, client)).overdue > 0;
}
