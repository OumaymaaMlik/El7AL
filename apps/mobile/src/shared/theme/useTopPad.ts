import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { layout } from './tokens';

/** Padding to put above the first row of a header or a full page: clear of the status bar, never flush with the top. */
export function useTopPad(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.top, layout.minTop) + layout.headerTop;
}
