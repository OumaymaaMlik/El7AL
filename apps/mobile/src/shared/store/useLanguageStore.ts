import { I18nManager, Platform } from 'react-native';
import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '../../services/storage/secureStorage';
import { translations, Language, TranslationKeys } from '../i18n/translations';
import { logger } from '../utils/logger';

/**
 * Applies the reading direction for a language (right-to-left for Arabic).
 *
 * On the web the page direction changes at once. On iOS and Android the system
 * only mirrors the layout when the app starts, so this returns `true` when the
 * app has to be restarted for the new direction to show.
 */
export function applyDirection(lang: Language): boolean {
  const rtl = lang === 'ar';

  if (Platform.OS === 'web') {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
    return false;
  }

  try {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.forceRTL(rtl);
      return true;
    }
  } catch (e) {
    logger.warn('Failed to apply layout direction:', e);
  }
  return false;
}

interface LanguageState {
  language: Language;
  /** True after a language change that needs an app restart to mirror the layout. */
  needsRestart: boolean;
  setLanguage: (lang: Language) => void;
  loadSavedLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'fr',
  needsRestart: false,

  setLanguage: (lang: Language) => {
    // 1. Instantaneous UI state update (0ms delay)
    const needsRestart = applyDirection(lang);
    set({ language: lang, needsRestart });

    // 2. Persist to storage in background asynchronously
    setStorageItem('app_language', lang).catch((e) => {
      logger.warn('Failed to save language setting:', e);
    });
  },

  loadSavedLanguage: async () => {
    try {
      const saved = (await getStorageItem('app_language')) as Language | null;
      if (saved === 'fr' || saved === 'ar' || saved === 'en') {
        applyDirection(saved);
        set({ language: saved });
      }
    } catch (e) {
      logger.warn('Failed to load saved language setting:', e);
    }
  },
}));

/**
 * Translates outside React (stores, socket handlers), in the language chosen at
 * the time of the call. Inside components use `useTranslation()` instead.
 */
export function translate(key: TranslationKeys): string {
  const language = useLanguageStore.getState().language;
  const langDict = translations[language] || translations.fr;
  return langDict[key] || translations.fr[key] || key;
}

/**
 * Custom hook for live reactive translation re-renders
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = (key: TranslationKeys): string => {
    const langDict = translations[language] || translations.fr;
    return langDict[key] || translations.fr[key] || key;
  };

  return { t, language };
}

/**
 * True when the layout currently runs right-to-left. Use it to mirror icons that
 * point in a direction (back arrows, chevrons).
 */
export function useIsRTL(): boolean {
  const language = useLanguageStore((state) => state.language);
  return Platform.OS === 'web' ? language === 'ar' : I18nManager.isRTL;
}

/**
 * On the web, a browser aligns each line by the script of its own text, so a
 * Latin name inside an Arabic screen would sit on the wrong side. This returns
 * the style that keeps such text on the leading (right) edge. iOS and Android
 * align by the app's direction already, so they get nothing.
 */
export function useLeadingTextAlign(): { textAlign: 'right' } | undefined {
  const isRTL = useIsRTL();
  return Platform.OS === 'web' && isRTL ? { textAlign: 'right' } : undefined;
}
