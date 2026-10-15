import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock, XCircle } from 'lucide-react-native';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';

/**
 * Shown to an artisan whose identity check is not finished (waiting for an admin) or was refused.
 * Nothing is shown once the account is active.
 */
export function VerificationBanner() {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const status = useAuthStore((state) => state.user?.status);
  const isProvider = useAuthStore((state) => state.user?.role === 'PROVIDER');

  if (!isProvider || !status || status === 'ACTIVE') return null;
  const refused = status === 'REJECTED';
  const Icon = refused ? XCircle : Clock;
  const tone = refused ? colors.dangerText : colors.text;

  return (
    <Surface style={styles.card}>
      <View style={styles.row}>
        <Icon size={20} color={tone} />
        <Txt variant="bodyStrong" color={tone} style={styles.flex}>
          {t(refused ? 'approvalRejectedTitle' : 'approvalPendingTitle')}
        </Txt>
      </View>
      <Txt variant="small" color={colors.textSecondary}>
        {t(refused ? 'approvalRejectedBody' : 'approvalPendingBody')}
      </Txt>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
});
