import type { TranslationKeys } from '../../../shared/i18n/translations';
import { formatAmount, toNumber, type BadgeTone } from '../../../shared/utils/format';

type T = (key: TranslationKeys) => string;

export function accountBadge(status: string, t: T): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'ACTIVE':
      return { label: t('statusActive'), tone: 'success' };
    case 'PENDING_VERIFICATION':
      return { label: t('statusPending'), tone: 'neutral' };
    case 'REJECTED':
      return { label: t('approvalRejectedTitle'), tone: 'danger' };
    case 'SUSPENDED_LOW_BALANCE':
      return { label: t('statusSuspended'), tone: 'danger' };
    default:
      return { label: t('statusBlocked'), tone: 'danger' };
  }
}

export function disputeBadge(status: string, t: T): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'RESOLVED':
      return { label: t('disputeResolved'), tone: 'success' };
    case 'DISMISSED':
      return { label: t('disputeDismissed'), tone: 'neutral' };
    default:
      return { label: t('disputeOpen'), tone: 'neutral' };
  }
}

/** The revenue a mission earned: its fixed fee, but only once both sides confirmed it (COMPLETED). Null otherwise. */
export function commissionOf(mission: { status?: string; commissionFee?: unknown }, t: T): string | null {
  if (mission.status !== 'COMPLETED') return null;
  const fee = toNumber(mission.commissionFee);
  return fee !== null && fee > 0 ? `${formatAmount(fee)} ${t('currency')}` : null;
}

export function statValue(value: unknown): string {
  const n = toNumber(value);
  return n === null ? '0' : formatAmount(n);
}
