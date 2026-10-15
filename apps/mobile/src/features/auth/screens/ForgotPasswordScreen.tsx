import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Hash, Lock, Phone } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { PasswordStrengthMeter } from '../../../shared/ui/PasswordStrengthMeter';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Txt } from '../../../shared/ui/Txt';
import { gutter, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const form = useForgotPassword();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Mot de passe oublié"
        onBack={() => (form.step === 2 ? form.backToIdentifier() : router.back())}
        trailing={null}
      />
      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {form.step === 1 ? (
          <>
            <Txt variant="bodyMedium" color={colors.textSecondary}>
              Entrez votre e-mail ou numéro de téléphone. Nous vous enverrons un code de vérification par e-mail.
            </Txt>
            <Input
              label="Téléphone ou E-mail"
              placeholder="22 123 456 ou nom@example.com"
              value={form.identifier}
              onChangeText={form.setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Phone size={18} color={colors.textMuted} />}
            />
            <AuthErrorBanner message={form.error} />
            <Button title="Envoyer le code" onPress={form.sendCode} loading={form.loading} />
          </>
        ) : (
          <>
            <Txt variant="bodyMedium" color={colors.textSecondary}>
              Si un compte correspond, un code vient d'être envoyé par e-mail. Entrez-le avec votre nouveau mot de
              passe.
            </Txt>
            <Input
              label="Code de vérification"
              placeholder="123456"
              value={form.code}
              onChangeText={form.setCode}
              keyboardType="number-pad"
              maxLength={8}
              icon={<Hash size={18} color={colors.textMuted} />}
            />
            <Input
              label="Nouveau mot de passe"
              value={form.newPassword}
              onChangeText={form.setNewPassword}
              secureTextEntry
              icon={<Lock size={18} color={colors.textMuted} />}
            />
            <PasswordStrengthMeter password={form.newPassword} />
            <AuthErrorBanner message={form.error} />
            <Button title="Réinitialiser" onPress={form.submitReset} loading={form.loading} />
            <Button title="Renvoyer le code" variant="outline" onPress={form.sendCode} disabled={form.loading} />
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: space.lg, paddingBottom: space.xxxl, gap: space.md },
});
