import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';

export { ACTIVATION_FEE_TND, COMMISSION_FEE_TND };

/** Tunisia is UTC+1 all year. */
const TUNIS_OFFSET_MS = 60 * 60 * 1000;

/**
 * When the commission of a job finished at `completedAt` must be paid: the end of that week, that is the following
 * Monday at 00:00 in Tunisia. (The first job of an artisan is the exception: it is due at once, see mission.progress.)
 */
export function endOfBillingWeek(completedAt: Date): Date {
  const local = new Date(completedAt.getTime() + TUNIS_OFFSET_MS);
  const daysToMonday = (8 - local.getUTCDay()) % 7 || 7;
  const monday = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + daysToMonday);
  return new Date(monday - TUNIS_OFFSET_MS);
}

/** Monday 00:00 in Tunisia of the week `now` belongs to. */
export function startOfBillingWeek(now: Date): Date {
  return new Date(endOfBillingWeek(now).getTime() - 7 * 24 * 60 * 60 * 1000);
}

/** Which fees an artisan accepted. It changes when a fee changes, so the artisan is asked to accept again. */
export const TERMS_VERSION = `activation-${ACTIVATION_FEE_TND}-commission-${COMMISSION_FEE_TND}-weekly`;

export const COMMISSION_DUE_MESSAGE = 'Réglez votre commission pour continuer à recevoir des demandes.';
