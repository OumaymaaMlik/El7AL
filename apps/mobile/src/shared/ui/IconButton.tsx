import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { hitTarget, radius } from '../theme/tokens';

interface IconButtonProps {
  /** Read by screen readers. Required because the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  children: React.ReactNode;
  /** `plain` has no background, for use on coloured panels. */
  variant?: 'surface' | 'plain';
  style?: StyleProp<ViewStyle>;
}

/** A 44pt icon-only button. */
export function IconButton({ accessibilityLabel, onPress, children, variant = 'surface', style }: IconButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'surface' && {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: hitTarget,
    height: hitTarget,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
