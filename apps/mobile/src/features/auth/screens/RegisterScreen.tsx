import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight, User, Wrench } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { Txt } from '../../../shared/ui/Txt';
import { gutter, hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { AddressMapSheet } from '../../map/components/AddressMapSheet';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('createAccountTitle')} onBack={goBack} trailing={null} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        <Txt variant="small" color={colors.textSecondary}>
          {t('registerIntro')}
        </Txt>

        <SegmentedControl<RegisterRole>
          value={form.role}
          onChange={form.changeRole}
          options={[
            { key: 'CLIENT', label: t('iAmClient'), icon: (color) => <User size={16} color={color} /> },
            { key: 'PROVIDER', label: t('iAmArtisan'), icon: (color) => <Wrench size={16} color={color} /> },
          ]}
        />

        {isProvider && <RegisterStepper currentStep={step} />}

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
              title={t('next')}
              onPress={form.next}
              icon={
                <Mirrored>
                  <ArrowRight size={18} color={colors.onAction} />
                </Mirrored>
              }
              style={styles.flex}
            />
          ) : (
            <Button
              title={isProvider ? t('submitApplication') : t('createClientAccount')}
              onPress={form.submit}
              loading={form.loading}
              style={styles.flex}
            />
          )}
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={form.goToLogin}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.accentText}>
            {t('hasAccount')}
          </Txt>
        </Pressable>
      </KeyboardAwareScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  footer: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  link: { minHeight: hitTarget, justifyContent: 'center', alignItems: 'center' },
});
