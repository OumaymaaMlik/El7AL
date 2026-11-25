import { StyleSheet, View } from 'react-native';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { space } from '../../../shared/theme/tokens';
import { formatAmount, formatDate } from '../../../shared/utils/format';
import type { TopupTransaction, WalletCharge } from '../api/wallet.api';

interface Props {
  charges: WalletCharge[];
  transfers: TopupTransaction[];
}

const TONE = { PENDING: 'neutral', APPROVED: 'success', REJECTED: 'danger' } as const;

function useMoney() {
  const { t } = useTranslation();
  return (n: number) => `${formatAmount(n)} ${t('currency')}`;
}

function ChargeRow({ charge }: { charge: WalletCharge }) {
  const colors = useThemeStore((s) => s.colors);
  const { t, language } = useTranslation();
  const money = useMoney();
  const activation = charge.activation > 0 ? ` + ${t('activationWord')} ${money(charge.activation)}` : '';
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {charge.categoryName ?? t('jobWord')}
        </Txt>
        <Txt variant="caption" color={colors.textMuted}>
          {`${formatDate(charge.createdAt, language)} · ${t('commissionWord')} ${money(charge.commission)}${activation}`}
        </Txt>
      </View>
      <Txt variant="bodyStrong">{money(charge.commission + charge.activation)}</Txt>
    </View>
  );
}

function TransferRow({ transfer }: { transfer: TopupTransaction }) {
  const colors = useThemeStore((s) => s.colors);
  const { t, language } = useTranslation();
  const money = useMoney();
  const status = { PENDING: t('transferPending'), APPROVED: t('transferApproved'), REJECTED: t('transferRefused') };
  const received = transfer.receivedAmount;
  const receivedText =
    received === null || received === undefined ? '' : ` · ${t('receivedWord')} ${money(Number(received))}`;
  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Txt variant="bodyStrong">{money(Number(transfer.amount) || 0)}</Txt>
        <Txt variant="caption" color={colors.textMuted}>
          {`${formatDate(transfer.createdAt, language)}${receivedText}`}
        </Txt>
      </View>
      <StatusBadge label={status[transfer.status]} tone={TONE[transfer.status]} />
    </View>
  );
}

/** A titled card of rows separated by hairlines; nothing when there is no row. */
function Section({ title, rows }: { title: string; rows: React.ReactElement[] }) {
  const colors = useThemeStore((s) => s.colors);
  if (rows.length === 0) return null;
  return (
    <>
      <Txt variant="overline" color={colors.textMuted}>
        {title}
      </Txt>
      <Surface>
        {rows.map((row, index) => (
          <View key={row.key}>
            {index > 0 && <Hairline />}
            {row}
          </View>
        ))}
      </Surface>
    </>
  );
}

/** What the artisan was charged for each job, and every transfer sent with what became of it. */
export function PayHistory({ charges, transfers }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Section
        title={t('chargesTitle')}
        rows={charges.map((c) => (
          <ChargeRow key={c.id} charge={c} />
        ))}
      />
      <Section
        title={t('transfersTitle')}
        rows={transfers.map((x) => (
          <TransferRow key={x.id} transfer={x} />
        ))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  flex: { flex: 1, minWidth: 0, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
});
