import { useMemo } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { getTypeScale, TypeScale } from './typography';

/** The type scale for the current language (Latin or Arabic). */
export function useType(): TypeScale {
  const language = useLanguageStore((state) => state.language);
  return useMemo(() => getTypeScale(language), [language]);
}
