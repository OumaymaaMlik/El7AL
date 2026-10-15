import React from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';
import { LanguageToggle } from '../../../shared/ui/LanguageToggle';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { wordmarkFont } from '../../../shared/theme/typography';
import { controlHeight, gutter, radius, space } from '../../../shared/theme/tokens';

/**
 * The first screen. The whole screen is the brand-green surface, with the name,
 * what the service is, and the two ways in. Language and theme can be set here
 * because there is no profile yet.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.brand }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* The "7" of the name, as a quiet mark behind the content */}
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.mark, { color: colors.brandInset }]}
      >
        7
      </Text>

      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Text
          accessibilityRole="header"
          accessibilityLabel="El 7al"
          style={[styles.wordmark, { color: colors.onBrand }]}
        >
          El <Text style={{ color: colors.action }}>7</Text>al
        </Text>
        <View style={styles.controls}>
          <LanguageToggle forceWhite />
          <ThemeToggle forceWhite />
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, space.lg) + space.lg }]}>
        <View style={styles.tagRow}>
          <View style={[styles.marker, { backgroundColor: colors.action }]} />
          <Txt variant="overline" color={colors.onBrandMuted}>
            {t('emergencyTag')}
          </Txt>
        </View>
        <Txt variant="display" color={colors.onBrand} style={styles.headline}>
          {t('heroTitle')}
        </Txt>

        <View style={styles.actions}>
          <Button title={t('login')} onPress={() => router.push('/(auth)/login')} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(auth)/register')}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.75 }]}
          >
            <Txt variant="button" color={colors.onBrand}>
              {t('register')}
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  mark: {
    position: 'absolute',
    end: -40,
    top: 60,
    fontFamily: wordmarkFont,
    fontSize: 520,
    lineHeight: 520,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
  },
  wordmark: {
    fontFamily: wordmarkFont,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  bottom: {
    paddingHorizontal: gutter,
    gap: space.md,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  marker: {
    width: 8,
    height: 8,
  },
  headline: {
    marginBottom: space.lg,
  },
  actions: {
    gap: space.sm,
  },
  secondary: {
    height: controlHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
