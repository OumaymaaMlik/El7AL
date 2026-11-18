import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';

interface Props {
  Icon: LucideIcon;
  label: string;
  /** What sits on the right: a value, a toggle. A chevron is added when the row opens something. */
  right?: React.ReactNode;
  onPress?: () => void;
}

/** One row of a profile card: a green-on-tint icon tile, the label, and the value or switch on the right. */
export function SettingRow({ Icon, label, right, onPress }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const content = (
    <>
      <View style={[styles.tile, { backgroundColor: colors.tint }]}>
        <Icon size={18} color={colors.accentText} />
      </View>
      <Txt variant="bodyStrong" style={styles.label} numberOfLines={1}>
        {label}
      </Txt>
      {right}
      {onPress && (
        <Mirrored>
          <ChevronRight size={14} color={colors.textMuted} strokeWidth={2.4} />
        </Mirrored>
      )}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  tile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, lineHeight: 20 },
});
