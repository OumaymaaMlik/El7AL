import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { PasswordStrengthMeter } from '../../../shared/ui/PasswordStrengthMeter';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { AuthHeader, type HeaderArt } from '../components/AuthHeader';
import { SlideScreen } from '../../../shared/ui/SlideScreen';
import { AuthLayout } from '../components/AuthLayout';
import { CodeBoxes } from '../components/CodeBoxes';
import { CODE_LENGTH, useForgotPassword } from '../hooks/useForgotPassword';

const RESEND_SECONDS = 60;

/**
 * Forgot password, in the prototype's three steps: the envelope flies to the door (e-mail), the key is cut
 * tooth by tooth as the code is typed (code), and the door opens on the new password (new password).
 */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const form = useForgotPassword();
  const { step } = form;

  const [confirm, setConfirm] = useState('');
  const [keyGoes, setKeyGoes] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  // Step 2: the resend countdown restarts each time the step is entered or the code is sent again.
  useEffect(() => {
    if (step !== 2) return;
    setSeconds(RESEND_SECONDS);
    setKeyGoes(false);
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [step]);

  // A complete code slides the key into the door, then moves on to the new password.
  useEffect(() => {
    if (step !== 2 || form.code.length < CODE_LENGTH) {
      setKeyGoes(false);
      return;
    }
    setKeyGoes(true);
    const id = setTimeout(() => form.continueWithCode(), 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form.code]);

  const teeth = form.code.length >= 6 ? 3 : form.code.length >= 4 ? 2 : form.code.length >= 2 ? 1 : 0;
  const art: HeaderArt =
    step === 1
      ? { kind: 'door', mode: 'env', offset: 'right' }
      : step === 2
        ? { kind: 'door', mode: 'build', offset: 'right', teeth, go: keyGoes }
        : { kind: 'door', mode: 'opening' };

  const mismatch = confirm.length > 0 && confirm !== form.newPassword;
  const time = `0:${String(seconds).padStart(2, '0')}`;

  const titles = [t('forgotStep1Title'), t('forgotStep2Title'), t('forgotStep3Title')];
  const subs = [t('forgotStep1Sub'), t('forgotStep2Sub').replace('{to}', form.identifier.trim()), t('forgotStep3Sub')];

  return (
    <SlideScreen>
      <AuthLayout header={<AuthHeader onBack={() => (form.backStep() ? undefined : router.back())} art={art} />}>
        <View style={styles.steps} accessibilityLabel={`${step} / 3`}>
          {[1, 2, 3].map((n) => (
            <View key={n} style={[styles.stepBar, { backgroundColor: n <= step ? colors.brand : colors.border }]} />
          ))}
        </View>

        <Txt variant="title" accessibilityRole="header" style={step === 3 ? styles.titleSmall : undefined}>
          {titles[step - 1]}
        </Txt>
        <Txt variant="body" color={colors.textMuted}>
          {subs[step - 1]}
        </Txt>

        <View style={styles.card}>
          {step === 1 && (
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
              <Button variant="primary" title={t('sendCode')} onPress={form.sendCode} loading={form.loading} />
            </>
          )}

          {step === 2 && (
            <>
              <CodeBoxes length={CODE_LENGTH} value={form.code} onChange={form.setCode} shakeKey={form.codeShake} />
              <AuthErrorBanner message={form.error} />
              <View style={styles.resend}>
                <Pressable
                  accessibilityRole="button"
                  disabled={seconds > 0 || form.loading}
                  onPress={() => {
                    form.setCode('');
                    form.sendCode();
                  }}
                  style={styles.resendLink}
                >
                  <Txt variant="smallStrong" color={seconds > 0 ? colors.textMuted : colors.accentText}>
                    {seconds > 0 ? t('resendIn').replace('{time}', time) : t('resendNow')}
                  </Txt>
                </Pressable>
              </View>
              <Button
                variant={form.code.length >= CODE_LENGTH ? 'primary' : 'secondary'}
                title={t('verify')}
                onPress={() => form.continueWithCode()}
                disabled={form.code.length < CODE_LENGTH}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Input
                placeholder={t('newPassword')}
                accessibilityLabel={t('newPassword')}
                value={form.newPassword}
                onChangeText={form.setNewPassword}
                secureTextEntry
                icon={<Lock size={18} color={colors.textMuted} />}
              />
              <PasswordStrengthMeter password={form.newPassword} />
              <Input
                placeholder={t('confirmPassword')}
                accessibilityLabel={t('confirmPassword')}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                error={mismatch ? t('passwordsDiffer') : undefined}
                icon={<Lock size={18} color={colors.textMuted} />}
              />
              <AuthErrorBanner message={form.error} />
              <Button
                variant={form.canReset && !mismatch && confirm ? 'primary' : 'secondary'}
                title={t('saveAndEnter')}
                onPress={form.submitReset}
                loading={form.loading}
                disabled={!form.canReset || mismatch || !confirm}
              />
              <Pressable accessibilityRole="button" onPress={() => form.backStep()} style={styles.resendLink}>
                <Txt variant="smallStrong" color={colors.accentText}>
                  {t('changeCode')}
                </Txt>
              </Pressable>
            </>
          )}
        </View>
      </AuthLayout>
    </SlideScreen>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', gap: 5 },
  stepBar: { flex: 1, height: 5, borderRadius: 3 },
  card: { gap: 16, marginTop: 8 },
  titleSmall: { fontSize: 28, lineHeight: 32 },
  resend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  resendLink: { minHeight: hitTarget, justifyContent: 'center', alignItems: 'center' },
});
