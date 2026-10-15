/**
 * Small display helpers shared by screens and dialogs.
 */
import { TranslationKeys } from '../i18n/translations';

type Translate = (key: TranslationKeys) => string;

/** Converts a backend number (possibly a decimal string) to a number, or null. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

/** "Sami Ben Salah" -> "SB". */
export function initialsOf(name?: string | null): string {
  return (
    (name || '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

/** "TERMINÉE" -> "Terminée". Leaves scripts without case (Arabic) untouched. */
export function capitalize(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text;
}

const LOCALES: Record<string, string> = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-GB' };

/** A short date in the user's language, e.g. "5 oct. 2026". Empty string if invalid. */
export function formatDate(value: string | undefined | null, language: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  try {
    return date.toLocaleDateString(LOCALES[language] || 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toLocaleDateString();
  }
}

/** Whole numbers without decimals, others with one decimal: 50 -> "50", 12.5 -> "12.5". */
export function formatAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
}

export type BadgeTone = 'success' | 'danger' | 'neutral';

/** The label and colour tone for a mission status shown in a list. */
export function missionBadge(status: string | undefined | null, t: Translate): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'COMPLETED':
      return { label: capitalize(t('completed')), tone: 'success' };
    case 'CANCELLED':
      return { label: capitalize(t('cancelled')), tone: 'danger' };
    case 'EN_ROUTE':
      return { label: capitalize(t('enRoute')), tone: 'neutral' };
    case 'ARRIVED':
      return { label: capitalize(t('onSite')), tone: 'neutral' };
    default:
      return { label: t('statusInProgress'), tone: 'neutral' };
  }
}
