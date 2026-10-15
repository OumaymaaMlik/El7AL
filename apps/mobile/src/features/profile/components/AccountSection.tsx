import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Mail, MapPin, Phone, ShieldCheck, User, Wallet, Wrench } from 'lucide-react-native';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { controlHeight, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isProvider: boolean;
  professions: string;
  address?: string;
  verified: boolean;
}

/** Account details: information, not controls. */
export function AccountSection({ fullName, phoneNumber, email, isProvider, professions, address, verified }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const rows = [
    { Icon: User, label: t('fullName'), value: fullName || t('notProvided') },
    { Icon: Phone, label: t('phone'), value: phoneNumber || t('notProvided') },
    { Icon: Mail, label: t('email'), value: email || t('notProvided') },
    ...(isProvider ? [{ Icon: Wrench, label: t('professionSpecialty'), value: professions || t('notProvided') }] : []),
    { Icon: Wallet, label: t('paymentMethods'), value: t('directPaymentLabel') },
    ...(!isProvider ? [{ Icon: MapPin, label: t('savedAddresses'), value: address || t('notProvided') }] : []),
  ];

  return (
    <View>
      <SectionHeader title={t('account')} />
      <Surface>
        {rows.map(({ Icon, label, value }, index) => (
          <React.Fragment key={label}>
            {index > 0 && <Hairline />}
            <View style={styles.row}>
              <Icon size={18} color={colors.textMuted} />
              <Txt variant="small" color={colors.textSecondary}>
                {label}
              </Txt>
              <View style={styles.value}>
                <Txt variant="bodyMedium" numberOfLines={1}>
                  {value}
                </Txt>
              </View>
            </View>
          </React.Fragment>
        ))}
        <Hairline />
        <View style={styles.row}>
          <ShieldCheck size={18} color={colors.textMuted} />
          <Txt variant="small" color={colors.textSecondary} style={styles.flex}>
            {t('identityVerified')}
          </Txt>
          <StatusBadge
            label={verified ? t('validated') : t('pendingVerification')}
            tone={verified ? 'success' : 'neutral'}
          />
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    minHeight: controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  value: { flex: 1, alignItems: 'flex-end' },
});
