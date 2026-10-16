import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { hitTarget, radius } from '../theme/tokens';

interface ThemeToggleProps {
  style?: StyleProp<ViewStyle>;
}

/** A compact dark/light button for screens shown before sign-in. */
export function ThemeToggle({ style }: ThemeToggleProps) {
  const { mode, colors, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const foreground = colors.text;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={t('darkTheme')}
      accessibilityState={{ checked: mode === 'dark' }}
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      {mode === 'dark' ? <Sun size={18} color={foreground} /> : <Moon size={18} color={foreground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: hitTarget,
    height: hitTarget,
    borderRadius: radius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
