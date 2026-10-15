import type { TranslationKeys } from '../../../shared/i18n/translations';
import type { Mission } from '../../missions';

/** The other party of a conversation, seen from the current user's role. */
export function contactNameOf(mission: Mission, isProvider: boolean, t: (key: TranslationKeys) => string): string {
  return isProvider
    ? mission.client?.user?.fullName || t('client')
    : mission.provider?.user?.fullName || t('artisanLabel');
}

export function contactAvatarOf(mission: Mission, isProvider: boolean): string | null {
  return (isProvider ? mission.client?.user?.avatarUrl : mission.provider?.user?.avatarUrl) || null;
}
