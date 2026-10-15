import { ar } from './locales/ar';
import { en } from './locales/en';
import { fr } from './locales/fr';

export type Language = 'fr' | 'ar' | 'en';

export const translations = { fr, ar, en };

/** Every translatable string; French is the source of truth. */
export type TranslationKeys = keyof typeof fr;
