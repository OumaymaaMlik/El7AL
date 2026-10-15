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

export function trackingHeadline(status: string | null, isProvider: boolean, mission: Mission | null, t: T): string {
  switch (status) {
    case 'ARRIVED':
      return t('providerArrived');
    case 'IN_PROGRESS':
      return t('workingWithClient');
    case 'DUAL_CONFIRM':
      return isProvider ? t('waitingClientConfirm') : t('dualModalTitle');
    default:
      return mission?.addressText ? `${t('requestInterventionAt')} ${mission.addressText}` : t('activeIntervention');
  }
}
