import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { AuthHeader } from '../components/AuthHeader';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { SlideScreen } from '../../../shared/ui/SlideScreen';
import { AuthLayout } from '../components/AuthLayout';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const form = useLogin();
  // A wrong password makes the door shiver.
  const [shiver, setShiver] = useState(0);
  const failed = form.errors.submit ?? form.errors.password;
  useEffect(() => {
    if (failed) setShiver((n) => n + 1);
  }, [failed]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(ROUTES.welcome);
  };

  return (
    <SlideScreen>
      <AuthLayout header={<AuthHeader onBack={goBack} art={{ kind: 'door', mode: 'loop', shake: shiver }} />}>
        <Txt variant="title" accessibilityRole="header">
          {t('loginTitle')}
        </Txt>

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
    </SlideScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  forgot: { alignSelf: 'flex-end', minHeight: hitTarget, justifyContent: 'center' },
  footer: { minHeight: hitTarget, justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
