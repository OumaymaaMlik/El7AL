import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'fr' | 'ar' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => {
        set({ language });
        if (language === 'ar') {
          document.documentElement.dir = 'rtl';
          document.documentElement.lang = 'ar';
        } else {
          document.documentElement.dir = 'ltr';
          document.documentElement.lang = language;
        }
      },
    }),
    {
      name: 'el7al_web_language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          if (state.language === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
          } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = state.language;
          }
        }
      },
    },
  ),
);
