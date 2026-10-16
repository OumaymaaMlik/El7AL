import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { AuthBackLink } from '../components/AuthBackLink';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthHero } from '../components/AuthHero';
import { AuthLayout } from '../components/AuthLayout';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const form = useLogin();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.welcome);
  };

  return (
    <AuthLayout>
      <AuthBackLink label={t('backToWelcome')} onPress={goBack} />
      <AuthHero compact title={t('loginHeroTitle')} text={t('loginHeroText')} />

      <View style={styles.heading}>
        <Txt variant="title" accessibilityRole="header">
          {t('loginTitle')}
        </Txt>
        <Txt variant="small" color={colors.textMuted}>
          {t('loginSubtitle')}
        </Txt>
      </View>

      <View style={styles.form}>
        <Input
          label={t('identifierLabel')}
          placeholder="nom@exemple.tn"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={form.identifier}
          onChangeText={(text) => {
            form.setIdentifier(text);
            form.clearError('identifier');
          }}
          error={form.errors.identifier}
          icon={<Mail size={18} color={colors.textMuted} />}
          returnKeyType="next"
        />

        <Input
          label={t('password')}
          placeholder="••••••••"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => {
            form.setPassword(text);
            form.clearError('password');
          }}
          error={form.errors.password}
          icon={<Lock size={18} color={colors.textMuted} />}
          returnKeyType="go"
          onSubmitEditing={form.submit}
        />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(ROUTES.forgotPassword)}
          style={({ pressed }) => [styles.forgot, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.accentText}>
            {t('forgotPasswordLink')}
          </Txt>
        </Pressable>

        <AuthErrorBanner message={form.errors.submit} />

        <Button
          variant="primary"
          title={t('login')}
          onPress={form.submit}
          loading={form.loading}
          icon={
            <Mirrored>
              <ArrowRight size={18} color={colors.onBrand} />
            </Mirrored>
          }
        />
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => router.push(ROUTES.register)}
        style={({ pressed }) => [styles.footer, pressed && { opacity: 0.7 }]}
      >
        <Txt variant="small" color={colors.textMuted} style={styles.centered}>
          {t('noAccountPrompt')}{' '}
          <Txt variant="smallStrong" color={colors.accentText}>
            {t('createAccountTitle')}
          </Txt>
        </Txt>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.xs },
  form: { gap: 14 },
  forgot: { alignSelf: 'flex-start', minHeight: hitTarget, justifyContent: 'center' },
  footer: { minHeight: hitTarget, justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
