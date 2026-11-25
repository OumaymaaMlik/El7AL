import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { formatAmount, formatDate } from '../../../shared/utils/format';
import { ROUTES } from '../../../navigation/routes';
import type { Wallet } from '../../wallet/api/wallet.api';
import { styles } from './ArtisanHome.styles';

interface Props {
  /** What to transfer now (the overdue amount, or everything when paying early). */
  due: number;
  blocked: boolean;
  wallet: Wallet | null;
}

function MoneyBox({ label, value, hint, warn }: { label: string; value: string; hint: string; warn?: boolean }) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <View
      style={[
        styles.moneyBox,
        {
          backgroundColor: warn ? colors.warnSoft : colors.surface,
          borderColor: warn ? colors.warnText : colors.border,
        },
      ]}
    >
      <Txt variant="caption" color={warn ? colors.warnText : colors.textMuted}>
        {label}
      </Txt>
      <Txt style={styles.moneyValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Txt>
      <Txt variant="caption" color={colors.textMuted}>
        {hint}
      </Txt>
    </View>
  );
}

/** The artisan's week in two figures: the cash collected from clients, and what is to be paid to El 7al. */
export function WeekMoney({ due, blocked, wallet }: Props) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const money = (n: number) => `${formatAmount(n)} ${t('currency')}`;

  // The date given by the server is Monday 00:00: the last day to pay is the Sunday before it.
  const nextDueAt = wallet?.nextDueAt;
  const lastDay = nextDueAt ? formatDate(new Date(Date.parse(nextDueAt) - 60000).toISOString(), language) : '';
  const toPayHint = () => {
    if (due <= 0) return t('nothingToPay');
    if (blocked || !lastDay) return t('payToUnblock');
    return t('payByDate').replace('{date}', lastDay);
  };

  return (
    <>
      <View style={styles.moneyRow}>
        <MoneyBox
          label={t('earnedWeek')}
          value={wallet ? money(wallet.earnedThisWeek ?? 0) : '—'}
          hint={t('jobsCount').replace('{count}', String(wallet?.jobsThisWeek ?? 0))}
        />
        <MoneyBox
          label={blocked ? t('toPayNow') : t('toPayWeekEnd')}
          value={money(due)}
          hint={toPayHint()}
          warn={blocked}
        />
      </View>
      {due > 0 && <Button title={t('payElHal')} variant="secondary" onPress={() => router.push(ROUTES.pay)} />}
    </>
  );
}
