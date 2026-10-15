import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Lock, Mail, MapPin, User } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { RegisterWizard } from '../hooks/useRegisterWizard';
import { PasswordStrengthMeter } from '../../../shared/ui/PasswordStrengthMeter';

/** Step 1: name, phone, email, password (+ default address for clients). */
export function IdentityStep({ form }: { form: RegisterWizard }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const { errors } = form;

  return (
    <>
      <Input
        label={t('fullName')}
        placeholder="Ahmed Ben Ali"
        value={form.fullName}
        onChangeText={(text) => {
          form.setFullName(text);
          form.clearError('fullName');
        }}
        error={errors.fullName}
        autoCapitalize="words"
        icon={<User size={18} color={colors.textMuted} />}
      />

      <Input
        label={`${t('phone')} *`}
        placeholder="XX XXX XXX"
        keyboardType="phone-pad"
        maxLength={10}
        value={form.phoneDigits}
        onChangeText={form.changePhone}
        error={errors.phone}
        icon={
          <View style={styles.phonePrefixWrap}>
            <Text style={styles.phoneFlag}>🇹🇳</Text>
            <Txt variant="bodyStrong" color={colors.text}>
              +216
            </Txt>
            <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />
          </View>
        }
      />

      <Input
        label={`${t('email')} *`}
        placeholder="nom@exemple.tn"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={form.email}
        onChangeText={(text) => {
          form.setEmail(text);
          form.clearError('email');
        }}
        error={errors.email}
        icon={<Mail size={18} color={colors.textMuted} />}
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
        error={errors.password}
        hint={t('passwordHint')}
        icon={<Lock size={18} color={colors.textMuted} />}
      />

      <PasswordStrengthMeter password={form.password} />

      {!form.isProvider && (
        <View style={styles.group}>
          <Input
            label={`${t('defaultAddressLabel')} ${t('optionalTag')}`}
            placeholder="Tunis, Lac 2"
            value={form.defaultAddress}
            onChangeText={form.setDefaultAddress}
            icon={<MapPin size={18} color={colors.textMuted} />}
          />
          <Button
            title="Placer sur la carte"
            variant="outline"
            onPress={() => form.setMapOpen(true)}
            iconPosition="left"
            icon={<MapPin size={16} color={colors.accentText} />}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.sm },
  phonePrefixWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingEnd: 4 },
  phoneFlag: { fontSize: 16 },
  phoneDivider: { width: 1, height: 18, marginStart: 4 },
});
