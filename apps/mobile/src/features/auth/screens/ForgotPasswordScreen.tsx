import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Hash, Lock, Mail } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { PasswordStrengthMeter } from '../../../shared/ui/PasswordStrengthMeter';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { AuthBackLink } from '../components/AuthBackLink';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthLayout } from '../components/AuthLayout';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const form = useForgotPassword();

  return (
    <AuthLayout>
      <AuthBackLink
        label={t('backToLogin')}
        onPress={() => (form.step === 2 ? form.backToIdentifier() : router.back())}
      />

      <View style={styles.heading}>
        <Txt variant="overline" color={colors.textSecondary}>
          {t('forgotEyebrow')}
        </Txt>
        <Txt variant="title" accessibilityRole="header">
          {t('forgotTitle')}
        </Txt>
        <Txt variant="body" color={colors.textMuted}>
          {form.step === 1 ? t('forgotIntro') : t('forgotSentIntro')}
        </Txt>
      </View>

      <Surface style={styles.card}>
        {form.step === 1 ? (
          <>
            <Input
              label={t('forgotIdentifierLabel')}
              placeholder="22 123 456 / nom@exemple.tn"
              value={form.identifier}
              onChangeText={form.setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={18} color={colors.textMuted} />}
            />
            <AuthErrorBanner message={form.error} />
            <Button
              variant="primary"
              title={t('sendCode')}
              onPress={form.sendCode}
              loading={form.loading}
              icon={
                <Mirrored>
                  <ArrowRight size={18} color={colors.onBrand} />
                </Mirrored>
              }
            />
          </>
        ) : (
          <>
            <Input
              label={t('verificationCode')}
              placeholder="123456"
              value={form.code}
              onChangeText={form.setCode}
              keyboardType="number-pad"
              maxLength={8}
              icon={<Hash size={18} color={colors.textMuted} />}
            />
            <Input
              label={t('newPassword')}
              value={form.newPassword}
              onChangeText={form.setNewPassword}
              secureTextEntry
              icon={<Lock size={18} color={colors.textMuted} />}
            />
            <PasswordStrengthMeter password={form.newPassword} />
            <AuthErrorBanner message={form.error} />
            <Button variant="primary" title={t('resetPassword')} onPress={form.submitReset} loading={form.loading} />
            <Button variant="outline" title={t('resendCode')} onPress={form.sendCode} disabled={form.loading} />
          </>
        )}
      </Surface>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.sm, marginTop: space.md },
  card: { padding: space.xl, gap: 16 },
});
