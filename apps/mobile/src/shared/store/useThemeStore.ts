import { create } from 'zustand';
import { getStorageItem, setStorageItem } from '../../services/storage/secureStorage';
import { DarkColors, LightColors } from '../theme/colors';
import { logger } from '../utils/logger';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof DarkColors;
  toggleTheme: () => void;
  loadSavedTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  colors: DarkColors,

  toggleTheme: async () => {
    const newMode: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    const newColors = newMode === 'dark' ? DarkColors : LightColors;

    try {
      await setStorageItem('app_theme', newMode);
    } catch (e) {
      logger.warn('Failed to save theme setting:', e);
    }

    set({ mode: newMode, colors: newColors });
  },

  loadSavedTheme: async () => {
    try {
      const savedMode = (await getStorageItem('app_theme')) as ThemeMode | null;
      if (savedMode === 'light' || savedMode === 'dark') {
        set({
          mode: savedMode,
          colors: savedMode === 'dark' ? DarkColors : LightColors,
        });
      }
    } catch (e) {
      logger.warn('Failed to load saved theme setting:', e);
    }
  },
}));
