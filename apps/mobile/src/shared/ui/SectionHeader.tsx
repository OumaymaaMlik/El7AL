import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { hitTarget, space } from '../theme/tokens';
import { Txt } from './Txt';

interface SectionHeaderProps {
  title: string;
  /** Optional quiet note on the trailing side, such as a count. */
  meta?: string;
  /** Optional text link on the trailing side. Only pass it when it does something. */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, meta, actionLabel, onAction, style }: SectionHeaderProps) {
  const colors = useThemeStore((state) => state.colors);
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <View style={[styles.row, !hasAction && styles.rowNoAction, style]}>
      <Txt variant="heading" accessibilityRole="header" style={styles.title}>
        {title}
      </Txt>
      {Boolean(meta) && !hasAction && (
        <Txt variant="small" color={colors.textMuted}>
          {meta}
        </Txt>
      )}
      {hasAction && (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.accentText}>
            {actionLabel}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  rowNoAction: {
    marginBottom: space.md,
  },
  title: {
    flex: 1,
  },
  action: {
    minHeight: hitTarget,
    justifyContent: 'center',
  },
});
