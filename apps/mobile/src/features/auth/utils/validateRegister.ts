import type { TranslationKeys } from '../../../shared/i18n/translations';

export interface RegisterErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  trades?: string;
  submit?: string;
}

type T = (key: TranslationKeys) => string;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Same rules as the server, checked on the identity step. */
export function validateIdentity(
  v: { fullName: string; phoneDigits: string; email: string; password: string },
  t: T,
): RegisterErrors {
  const errors: RegisterErrors = {};
  if (v.fullName.trim().length < 2) errors.fullName = t('errNameRequired');
  if (v.phoneDigits.replace(/\D/g, '').length !== 8) errors.phone = t('errPhoneInvalid');
  if (v.password.length < 8) errors.password = t('errPasswordShort');

  const email = v.email.trim();
  if (!email) errors.email = t('errEmailRequired') || 'Veuillez saisir votre adresse e-mail.';
  else if (!EMAIL_RE.test(email)) errors.email = t('errEmailInvalid') || 'Adresse e-mail invalide.';
  return errors;
}

export const hasErrors = (e: RegisterErrors) => Object.values(e).some(Boolean);
