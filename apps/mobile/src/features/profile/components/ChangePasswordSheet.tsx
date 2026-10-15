import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { PasswordStrengthMeter } from '../../../shared/ui/PasswordStrengthMeter';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import type { EditProfileForm } from '../hooks/useEditProfile';

export function ChangePasswordSheet({ form }: { form: EditProfileForm }) {
  const colors = useThemeStore((state) => state.colors);
  const icon = <ShieldCheck size={18} color={colors.textMuted} />;
  const mismatch = form.newPassword !== form.confirmPassword && form.confirmPassword.length > 0;

  return (
    <BottomSheet
      visible={form.passwordOpen}
      onClose={() => form.setPasswordOpen(false)}
      title="Changer le mot de passe"
    >
      <View style={styles.form}>
        <Input
          label="Ancien mot de passe"
          placeholder="••••••••"
          value={form.oldPassword}
          onChangeText={form.setOldPassword}
          secureTextEntry
          icon={icon}
        />
        <Input
          label="Nouveau mot de passe"
          placeholder="••••••••"
          value={form.newPassword}
          onChangeText={form.setNewPassword}
          secureTextEntry
          icon={icon}
        />

        <PasswordStrengthMeter password={form.newPassword} />

        <Input
          label="Confirmer le nouveau mot de passe"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChangeText={form.setConfirmPassword}
          secureTextEntry
          icon={icon}
        />

        {mismatch && (
          <Txt variant="small" color={colors.dangerText} style={{ marginTop: -8 }}>
            Les mots de passe ne correspondent pas.
          </Txt>
        )}

        <Button
          title="Valider le nouveau mot de passe"
          onPress={form.confirmNewPassword}
          disabled={!form.passwordValid}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: { gap: space.lg },
});
