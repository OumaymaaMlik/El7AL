import React, { useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, View, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { AddressMapSheet } from '../../map/components/AddressMapSheet';
import { AuthHeader, lineupHeaderHeights } from '../components/AuthHeader';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { SlideScreen } from '../../../shared/ui/SlideScreen';
import { AuthLayout } from '../components/AuthLayout';
import { DocumentsStep } from '../components/DocumentsStep';
import { IdentityStep } from '../components/IdentityStep';
import { OtpVerificationSheet } from '../components/OtpVerificationSheet';
import { RegisterStepper } from '../components/RegisterStepper';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { TradesStep } from '../components/TradesStep';
import { REGISTER_STEP_COUNT, useRegisterWizard } from '../hooks/useRegisterWizard';
import { useFormFocus } from '../hooks/useFormFocus';

export function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const form = useRegisterWizard(params.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT');
  const { isProvider, step } = form;

  // The header collapses as the form scrolls up, then settles fully open or fully closed.
  const { max, range } = lineupHeaderHeights(insets.top);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scroller = useRef<KeyboardAwareScrollView>(null);
  const lastY = useRef(0);
  const dir = useRef(1);
  const typing = useFormFocus();
  const [roleKey, setRoleKey] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (Math.abs(y - lastY.current) > 1) dir.current = y > lastY.current ? 1 : -1;
    lastY.current = y;
    scrollY.setValue(y);
  };
  const settle = (y: number) => {
    if (y > 4 && y < range - 4) scroller.current?.scrollToPosition(0, dir.current > 0 ? range : 0, true);
  };

  const goBack = () => {
    if (!form.goBackStep()) form.exit();
  };

  const footer = (
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
          style={styles.flex}
        />
      )}
    </View>
  );

  return (
    <SlideScreen>
      <AuthLayout
        overlayHeight={max}
        scrollRef={scroller}
        onScroll={onScroll}
        onScrollEnd={settle}
        footer={footer}
        header={<AuthHeader onBack={goBack} art={{ kind: 'lineup', paused: typing }} scrollY={scrollY} />}
      >
        <View style={styles.titleRow}>
          <Txt variant="title" accessibilityRole="header" style={styles.title}>
            {t('registerTitle')}
          </Txt>
          <PoppingRole
            key={roleKey}
            label={`(${isProvider ? t('roleArtisan') : t('roleClient')})`}
            color={colors.accentText}
          />
        </View>

        <SegmentedControl
          options={[
            { key: 'CLIENT', label: t('roleClient') },
            { key: 'PROVIDER', label: t('roleArtisan') },
          ]}
          value={form.role}
          onChange={(next) => {
            form.changeRole(next);
            setRoleKey((k) => k + 1);
          }}
        />

        {isProvider && <RegisterStepper currentStep={step} />}

        <View style={styles.card}>
          {(!isProvider || step === 1) && <IdentityStep form={form} />}
          {isProvider && step === 2 && <TradesStep form={form} />}
          {isProvider && step === 3 && <DocumentsStep form={form} />}

          <AuthErrorBanner message={form.errors.submit} />

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
        </View>

        <OtpVerificationSheet
          visible={form.otpVisible}
          onClose={() => form.setOtpVisible(false)}
          onSuccess={form.performRegister}
          email={form.email.trim()}
          fullName={form.fullName.trim()}
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
    </SlideScreen>
  );
}

/** The "(Client)" / "(Artisan)" tag next to the title: it pops in each time the role changes. */
function PoppingRole({ label, color }: { label: string; color: string }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [scale]);
  return (
    <Animated.View
      style={{
        opacity: scale.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
        transform: [{ scale }],
      }}
    >
      <Txt variant="heading" color={color}>
        {label}
      </Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: space.sm },
  title: { fontSize: 32, lineHeight: 36 },
  footer: { flexDirection: 'row', gap: 10 },
  link: { minHeight: hitTarget, justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
