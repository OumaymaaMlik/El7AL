import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, User, Wrench } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { AddressMapSheet } from '../../map/components/AddressMapSheet';
import { AuthBackLink } from '../components/AuthBackLink';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthHero } from '../components/AuthHero';
import { AuthLayout } from '../components/AuthLayout';
import { DocumentsStep } from '../components/DocumentsStep';
import { IdentityStep } from '../components/IdentityStep';
import { OtpVerificationSheet } from '../components/OtpVerificationSheet';
import { RegisterStepper } from '../components/RegisterStepper';
import { TradesStep } from '../components/TradesStep';
import { REGISTER_STEP_COUNT, useRegisterWizard, type RegisterRole } from '../hooks/useRegisterWizard';

export function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const form = useRegisterWizard(params.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT');
  const { isProvider, step } = form;

  const goBack = () => {
    if (!form.goBackStep()) form.exit();
  };

  return (
    <AuthLayout>
      <AuthBackLink label={t('backToWelcome')} onPress={goBack} />
      <AuthHero compact title={t('registerHeroTitle')} text={t('registerHeroText')} />

      <SegmentedControl<RegisterRole>
        value={form.role}
        onChange={form.changeRole}
        options={[
          { key: 'CLIENT', label: t('iAmClient'), icon: (color) => <User size={16} color={color} /> },
          { key: 'PROVIDER', label: t('iAmArtisan'), icon: (color) => <Wrench size={16} color={color} /> },
        ]}
      />

      {isProvider && <RegisterStepper currentStep={step} />}

      <Surface style={styles.card}>
        <View style={styles.heading}>
          <Txt variant="overline" color={colors.textSecondary}>
            {isProvider ? t('accountEyebrowArtisan') : t('accountEyebrowClient')}
          </Txt>
          <Txt variant="title" accessibilityRole="header" style={styles.title}>
            {isProvider ? t('createArtisanTitle') : t('createClientTitle')}
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            {isProvider ? t('artisanIntro') : t('clientIntro')}
          </Txt>
        </View>

        {(!isProvider || step === 1) && (
          <View style={styles.section}>
            <Txt variant="smallStrong">{t('accountInfoTitle')}</Txt>
            <Txt variant="caption" color={colors.textMuted}>
              {t('accountInfoText')}
            </Txt>
            <Hairline style={styles.sectionLine} />
          </View>
        )}

        {(!isProvider || step === 1) && <IdentityStep form={form} />}
        {isProvider && step === 2 && <TradesStep form={form} />}
        {isProvider && step === 3 && <DocumentsStep form={form} />}

        <AuthErrorBanner message={form.errors.submit} />

        <View style={styles.footer}>
          {isProvider && step > 1 && (
            <Button
              title={t('previous')}
              variant="outline"
              onPress={form.previous}
              iconPosition="left"
              icon={
                <Mirrored>
                  <ArrowLeft size={18} color={colors.text} />
                </Mirrored>
              }
              style={styles.flex}
              disabled={form.loading}
            />
          )}

          {isProvider && step < REGISTER_STEP_COUNT ? (
            <Button
              variant="primary"
              title={t('next')}
              onPress={form.next}
              icon={
                <Mirrored>
                  <ArrowRight size={18} color={colors.onBrand} />
                </Mirrored>
              }
              style={styles.flex}
            />
          ) : (
            <Button
              variant="primary"
              title={isProvider ? t('submitApplication') : t('createClientAccount')}
              onPress={form.submit}
              loading={form.loading}
              icon={
                <Mirrored>
                  <ArrowRight size={18} color={colors.onBrand} />
                </Mirrored>
              }
              style={styles.flex}
            />
          )}
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={form.goToLogin}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="small" color={colors.textMuted} style={styles.centered}>
            {t('hasAccountPrompt')}{' '}
            <Txt variant="smallStrong" color={colors.accentText}>
              {t('login')}
            </Txt>
          </Txt>
        </Pressable>
      </Surface>

      <OtpVerificationSheet
        visible={form.otpVisible}
        onClose={() => form.setOtpVisible(false)}
        onSuccess={form.performRegister}
        email={form.email.trim()}
        fullName={form.fullName.trim()}
        initialCode={form.devCode}
        loading={form.loading}
      />

      <AddressMapSheet
        visible={form.mapOpen}
        lat={form.lat}
        lng={form.lng}
        onClose={() => form.setMapOpen(false)}
        onSelect={form.selectMapLocation}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: space.xl, gap: 16 },
  heading: { gap: space.xs },
  // The card title is a step below a page title.
  title: { fontSize: 30, lineHeight: 33 },
  section: { gap: 2 },
  sectionLine: { marginTop: space.sm },
  footer: { flexDirection: 'row', gap: 10, marginTop: space.xs },
  link: { minHeight: hitTarget, justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
