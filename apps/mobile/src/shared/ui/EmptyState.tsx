import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { space } from '../theme/tokens';
import { Txt } from './Txt';

interface EmptyStateProps {
  /** An icon, sized about 24. It is shown in a round badge. */
  icon?: React.ReactNode;
  title: string;
  message?: string;
  /** Optional button(s) that lead out of the empty state. */
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * What a screen or list shows when there is nothing yet: what is missing, why,
 * and where possible one way forward.
 */
export function EmptyState({ icon, title, message, action, style }: EmptyStateProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={[styles.box, style]}>
      {icon && <View style={[styles.badge, { backgroundColor: colors.raised }]}>{icon}</View>}
      <Txt variant="heading" style={styles.center}>
        {title}
      </Txt>
      {Boolean(message) && (
        <Txt variant="small" color={colors.textSecondary} style={styles.center}>
          {message}
        </Txt>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxxl,
    paddingHorizontal: space.lg,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  center: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: space.md,
  },
});
