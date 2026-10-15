import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { radius } from '../theme/tokens';

/**
 * The standard panel: an opaque surface with a 1px border, in both themes.
 * Use it for lists, grouped rows and stat panels. It clips its children, so rows
 * inside it can run edge to edge.
 */
export function Surface({ style, children, ...rest }: ViewProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** A 1px divider between rows inside a Surface. */
export function Hairline({ style, ...rest }: ViewProps) {
  const colors = useThemeStore((state) => state.colors);
  return <View {...rest} style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}
