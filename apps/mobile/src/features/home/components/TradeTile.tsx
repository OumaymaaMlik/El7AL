import { StyleSheet, View } from 'react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { CATEGORY_ICONS } from './categoryIcons';

/** Round tool tile used on mission rows: the trade's icon on a tinted square. */
export function TradeTile({ name, size }: { name?: string | null; size: number }) {
  const colors = useThemeStore((s) => s.colors);
  const lower = (name ?? '').toLowerCase();
  const key = Object.keys(CATEGORY_ICONS).find((k) => lower.includes(k.toLowerCase())) ?? 'Wrench';
  const Icon = CATEGORY_ICONS[key];
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size >= 46 ? 8 : 10, backgroundColor: colors.tint },
      ]}
    >
      <Icon size={size * 0.46} color={colors.accentText} strokeWidth={1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});
