import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Mail, MapPin, ShieldCheck, Wallet, Wrench } from 'lucide-react-native';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { SettingRow } from './SettingRow';
import { useRouter } from 'expo-router';
import { Button } from '../../../shared/ui/Button';
import { ROUTES } from '../../../navigation/routes';

interface Props {
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  isProvider: boolean;
  professions: string;
  address?: string;
  verified: boolean;
}

/** Account details as a card of icon rows (the name and number are already on the green card above). */
export function AccountSection({ email, isProvider, professions, address, verified }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const router = useRouter();

  const value = (text: string) => (
    <View style={styles.value}>
      <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
        {text}
      </Txt>
    </View>
  );

  const rows = [
    { Icon: Mail, label: t('email'), right: value(email || t('notProvided')) },
    ...(isProvider
      ? [{ Icon: Wrench, label: t('professionSpecialty'), right: value(professions || t('notProvided')) }]
      : []),
    { Icon: Wallet, label: t('paymentMethods'), right: value(t('directPaymentLabel')) },
    ...(!isProvider ? [{ Icon: MapPin, label: t('savedAddresses'), right: value(address || t('notProvided')) }] : []),
    {
      Icon: ShieldCheck,
      label: t('identityVerified'),
      right: (
        <StatusBadge
          label={verified ? t('validated') : t('pendingVerification')}
          tone={verified ? 'success' : 'neutral'}
        />
      ),
    },
  ];

  return (
    <View style={styles.wrap}>
      <Surface>
        {rows.map(({ Icon, label, right }, index) => (
          <React.Fragment key={label}>
            {index > 0 && <Hairline style={styles.sep} />}
            <SettingRow Icon={Icon} label={label} right={right} />
          </React.Fragment>
        ))}
      </Surface>
      {isProvider && <Button title={t('myPayments')} variant="outline" onPress={() => router.push(ROUTES.pay)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  sep: { marginStart: 64 },
  value: { flexShrink: 1, maxWidth: 150, alignItems: 'flex-end' },
});
