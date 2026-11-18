import type { TranslationKeys } from '../../../shared/i18n/translations';
import type { Mission } from '../schemas/mission.schema';

type T = (key: TranslationKeys) => string;

export function trackingStatusLabel(status: string | null, isProvider: boolean, t: T): string {
  switch (status) {
    case 'EN_ROUTE':
      return t('enRoute');
    case 'ARRIVED':
      return t('onSite');
    case 'IN_PROGRESS':
      return t('workInProgress');
    case 'DUAL_CONFIRM':
      return isProvider ? t('waitingClient') : t('validationRequired');
    default:
      return t('activeIntervention');
  }
}

/** The big line at the top of the live screen: "Vers Samir", "Ahmed arrive", "Travaux en cours"... */
export function trackingHeadline(
  status: string | null,
  isProvider: boolean,
  mission: Mission | null,
  t: T,
  partnerName?: string,
): string {
  const first = (partnerName ?? '').trim().split(/\s+/)[0] ?? '';
  const named = (key: 'headingTo' | 'atClient' | 'partnerArrives') => t(key).replace('{name}', first);
  switch (status) {
    case 'ACCEPTED':
    case 'EN_ROUTE':
      if (first) return isProvider ? named('headingTo') : named('partnerArrives');
      break;
    case 'ARRIVED':
      if (isProvider && first) return named('atClient');
      return t('providerArrived');
    case 'IN_PROGRESS':
      return t('workingWithClient');
    case 'DUAL_CONFIRM':
      return isProvider ? t('waitingClientConfirm') : t('dualModalTitle');
  }
  return mission?.addressText ? `${t('requestInterventionAt')} ${mission.addressText}` : t('activeIntervention');
}
