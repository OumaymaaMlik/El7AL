import type { TranslationKeys } from '../../../shared/i18n/translations';

type T = (key: TranslationKeys) => string;
type Status = string | null;

export function providerStatusLabel(status: Status, t: T): string {
  switch (status) {
    case 'EN_ROUTE':
      return t('enRoute');
    case 'ARRIVED':
      return t('onSite');
    case 'IN_PROGRESS':
      return t('workInProgress');
    case 'DUAL_CONFIRM':
      return t('waitingClient');
    default:
      return t('missionAssigned');
  }
}

export function providerHeadline(status: Status, t: T): string {
  switch (status) {
    case 'ARRIVED':
      return t('arrivedClient');
    case 'IN_PROGRESS':
      return t('workingWithClient');
    case 'DUAL_CONFIRM':
      return t('waitingClientConfirm');
    default:
      return t('clientAcceptedReady');
  }
}

export function clientStatusLabel(status: Status, t: T): string {
  switch (status) {
    case 'EN_ROUTE':
      return t('enRoute');
    case 'ARRIVED':
      return t('onSite');
    case 'IN_PROGRESS':
      return t('workInProgress');
    case 'DUAL_CONFIRM':
      return t('validationRequired');
    case 'ACCEPTED':
      return t('technicianAssigned');
    default:
      return t('activeIntervention');
  }
}

export function clientHeadline(status: Status, t: T): string {
  switch (status) {
    case 'ARRIVED':
      return t('technicianArrived');
    case 'IN_PROGRESS':
      return t('workingWithClient');
    case 'DUAL_CONFIRM':
      return t('waitingClientConfirm');
    default:
      return t('clientAcceptedReady');
  }
}
