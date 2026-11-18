import { StyleSheet, View } from 'react-native';
import { AlertCircle, XCircle } from 'lucide-react-native';
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
  const Icon = refused ? XCircle : AlertCircle;
  const tone = refused ? colors.dangerText : colors.warnText;

  return (
    <View style={[styles.card, { backgroundColor: refused ? colors.dangerSoft : colors.warnSoft }]}>
      <View style={styles.row}>
        <Icon size={20} color={tone} />
        <Txt variant="bodyStrong" color={tone} style={styles.flex}>
          {t(refused ? 'approvalRejectedTitle' : 'approvalPendingTitle')}
        </Txt>
      </View>
      <Txt variant="small" color={colors.textMuted}>
        {t(refused ? 'approvalRejectedBody' : 'approvalPendingBody')}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, gap: space.sm, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
});
