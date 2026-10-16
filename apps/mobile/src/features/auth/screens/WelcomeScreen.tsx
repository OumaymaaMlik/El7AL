import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Navigation, ShieldCheck, Star } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { BrandMark } from '../../../shared/ui/BrandMark';
import { LanguageToggle } from '../../../shared/ui/LanguageToggle';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { space } from '../../../shared/theme/tokens';
import { AuthHero } from '../components/AuthHero';
import { AuthLayout } from '../components/AuthLayout';

/**
 * The first screen: the name, what the service is, and the two ways in. Language and theme can be set
 * here because there is no profile yet.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const trust = [
    { Icon: ShieldCheck, label: t('welcomeTrustVerified') },
    { Icon: Navigation, label: t('welcomeTrustLive') },
    { Icon: Star, label: t('welcomeTrustReviews') },
  ];

  return (
    <AuthLayout>
      <View style={styles.header}>
        <BrandMark />
        <View style={styles.controls}>
          <LanguageToggle />
          <ThemeToggle />
        </View>
      </View>

      <AuthHero tag={t('accessTag')} title={t('welcomeHeadline')} text={t('welcomeText')} />

      <View style={styles.actions}>
        <Button
          variant="primary"
          title={t('login')}
          onPress={() => router.push('/(auth)/login')}
          icon={
            <Mirrored>
              <ArrowRight size={18} color={colors.onBrand} />
            </Mirrored>
          }
        />
        <Button variant="outline" title={t('register')} onPress={() => router.push('/(auth)/register')} />
      </View>

      <View style={styles.trust}>
        {trust.map(({ Icon, label }) => (
          <View key={label} style={styles.trustItem}>
            <Icon size={14} color={colors.accentText} />
            <Txt variant="captionStrong" color={colors.accentText}>
              {label}
            </Txt>
          </View>
        ))}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actions: { gap: 10 },
  trust: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: space.xs },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
});
