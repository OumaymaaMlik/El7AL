import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';

export function AuthErrorBanner({ message }: { message?: string }) {
  const colors = useThemeStore((state) => state.colors);
  if (!message) return null;
  return (
    <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
      <AlertTriangle size={16} color={colors.dangerText} />
      <Txt variant="small" color={colors.dangerText} style={styles.text}>
        {message}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
  },
  text: { flex: 1 },
});
