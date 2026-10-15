import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Txt } from '../../../shared/ui/Txt';
import { gutter, hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('loginTitle')} onBack={goBack} trailing={null} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t('identifierLabel')}
          placeholder="nom@example.com"
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

        <AuthErrorBanner message={form.errors.submit} />

        <Button title={t('login')} onPress={form.submit} loading={form.loading} style={styles.submit} />

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(ROUTES.forgotPassword)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.textSecondary}>
            Mot de passe oublié ?
          </Txt>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          onPress={() => router.push(ROUTES.register)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="smallStrong" color={colors.accentText}>
            {t('noAccount')}
          </Txt>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: gutter,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  submit: { marginTop: space.sm },
  link: { minHeight: hitTarget, justifyContent: 'center', alignItems: 'center' },
});
