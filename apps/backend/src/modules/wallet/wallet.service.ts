import { db } from '../../config/db.js';
import crypto from 'crypto';
import { MissionStatus, TransactionStatus } from '@el7al/shared';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND, TERMS_VERSION, startOfBillingWeek } from '../../config/business.js';
import { currentRib } from './wallet.rib.js';
import { standingOf, type Standing } from './wallet.standing.js';
import { publish } from '../../events/domain-events.js';

const HISTORY_LIMIT = 50;

function generateUniqueRef(): string {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EL7AL-REF-${randomHex}`;
}

async function profileOf(providerUserId: string) {
  const profile = await db.providerProfile.findUnique({ where: { userId: providerUserId } });
  if (!profile) throw new Error('Provider profile not found');
  return profile;
}

/** What a transfer pays: the overdue amount if there is one, otherwise everything owed (paying early). */
const payableNow = (standing: Standing) => (standing.overdue > 0 ? standing.overdue : standing.owed);

/**
 * A transfer receipt from the artisan, for an admin to check against the bank account. One at a time. The amount is
 * decided here, so a typing mistake cannot leave the account half paid.
 */
export async function requestTopup(providerUserId: string, receiptPhotoUrl: string) {
  const profile = await profileOf(providerUserId);
  const amount = payableNow(await standingOf(profile));
  if (amount <= 0) throw new Error("Vous ne devez rien pour l'instant.");

  const waiting = await db.topupTransaction.count({
    where: { providerId: profile.id, status: TransactionStatus.PENDING },
  });
  if (waiting > 0) throw new Error('Un virement est déjà en cours de vérification.');

  const topup = await db.topupTransaction.create({
    data: {
      providerId: profile.id,
      uniqueRef: generateUniqueRef(),
      amount,
      receiptPhotoUrl,
      status: TransactionStatus.PENDING,
    },
    include: { provider: { select: { user: { select: { fullName: true } } } } },
  });
  await publish('topup.requested', { providerName: topup.provider.user.fullName, amount: Number(topup.amount) });
  return topup;
}

/** The charges of the artisan's finished jobs, newest first, with the trade of each job. */
async function chargesOf(providerId: string) {
  const charges = await db.walletCharge.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
  });
  const missions = await db.mission.findMany({
    where: { id: { in: charges.map((c) => c.missionId) } },
    select: { id: true, category: { select: { name: true } } },
  });
  const trade = new Map(missions.map((m) => [m.id, m.category?.name ?? null]));
  return charges.map((c) => ({
    id: c.id,
    createdAt: c.createdAt,
    commission: Number(c.commission),
    activation: Number(c.activation),
    categoryName: trade.get(c.missionId) ?? null,
  }));
}

/** The cash the clients paid the artisan for the jobs finished since Monday. */
async function earnedThisWeek(providerId: string) {
  const jobs = await db.mission.aggregate({
    where: { providerId, status: MissionStatus.COMPLETED, completedAt: { gte: startOfBillingWeek(new Date()) } },
    _sum: { declaredAmount: true },
    _count: true,
  });
  return { earnedThisWeek: Number(jobs._sum.declaredAmount ?? 0), jobsThisWeek: jobs._count };
}

export async function getProviderTransactions(providerUserId: string) {
  const profile = await profileOf(providerUserId);
  const [transactions, charges] = await Promise.all([
    db.topupTransaction.findMany({
      where: { providerId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
    }),
    chargesOf(profile.id),
  ]);

  const [standing, week, account] = await Promise.all([standingOf(profile), earnedThisWeek(profile.id), currentRib()]);

  return {
    walletBalance: profile.walletBalance,
    transactions,
    charges,
    // What the app shows: whether an overdue amount stops the artisan, what to transfer now, and what is to come.
    blocked: standing.overdue > 0,
    due: payableNow(standing),
    ...standing,
    ...week,
    // El 7al's bank account for the transfer (set by the admin), shown by the web and the mobile app alike.
    rib: account.rib,
    activationFee: ACTIVATION_FEE_TND,
    commissionFee: COMMISSION_FEE_TND,
    // The artisan is asked to accept the fees until these exact ones were accepted.
    termsAccepted: profile.termsVersion === TERMS_VERSION,
    termsAcceptedAt: profile.termsAcceptedAt,
  };
}

/** Keeps the proof that the artisan accepted the fees: when, and which fees. Accepting twice changes nothing. */
export async function acceptTerms(providerUserId: string) {
  const profile = await profileOf(providerUserId);
  if (profile.termsVersion === TERMS_VERSION) {
    return { termsAcceptedAt: profile.termsAcceptedAt, termsVersion: profile.termsVersion };
  }
  const updated = await db.providerProfile.update({
    where: { id: profile.id },
    data: { termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION },
  });
  return { termsAcceptedAt: updated.termsAcceptedAt, termsVersion: updated.termsVersion };
}
