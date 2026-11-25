import { Pressable, StyleSheet, View } from 'react-native';
import { AlertTriangle, ChevronRight, ShieldCheck, Wallet } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { StatCell } from '../../../shared/ui/StatCell';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { toNumber } from '../../../shared/utils/format';
import type { AdminStats, AdminTab } from '../schemas/admin.schema';
import { statValue } from '../utils/adminLabels';

/** One thing waiting for the admin: an icon tile, what it is, how many, and a chevron into the tab that handles it. */
function TodoRow({
  Icon,
  label,
  count,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const colors = useThemeStore((s) => s.colors);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.todo, pressed && { backgroundColor: colors.raised }]}
    >
      <View style={[styles.tile, { backgroundColor: colors.tint }]}>
        <Icon size={18} color={colors.accentText} />
      </View>
      <Txt variant="bodyStrong" style={styles.todoLabel} numberOfLines={1}>
        {label}
      </Txt>
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.brand }]}>
          <Txt style={styles.badgeText}>{count}</Txt>
        </View>
      )}
      <Mirrored>
        <ChevronRight size={14} color={colors.textMuted} strokeWidth={2.4} />
      </Mirrored>
    </Pressable>
  );
}

/** What artisans were charged (the activation fees among it) and what is still unpaid. One line each, so large
 * amounts always fit. */
function MoneyCard({ stats }: { stats: AdminStats | null }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const lines = [
    { label: t('moneyBilled'), value: stats?.billedTotalTND },
    { label: t('moneyActivation'), value: stats?.activationBilledTND },
    { label: t('moneyUnpaid'), value: stats?.unpaidTotalTND },
  ];
  return (
    <Surface>
      {lines.map((line) => (
        <View
          key={line.label}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}
        >
          <Txt variant="small" color={colors.textMuted}>
            {line.label}
          </Txt>
          <Txt variant="bodyStrong">{`${statValue(line.value)} ${t('currency')}`}</Txt>
        </View>
      ))}
    </Surface>
  );
}

/**
 * The admin's first page, as in the prototype: a green card with the money and the finished jobs, the figures by
 * period, then "À traiter" (what is waiting for the admin, each row opening its tab) and the active artisans.
 */
export function AnalyticsTab({
  stats,
  loading,
  onOpenTab,
}: {
  stats: AdminStats | null;
  loading: boolean;
  onOpenTab: (tab: AdminTab) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  if (loading && !stats) return <Skeleton style={styles.skeleton} />;

  return (
    <>
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <View style={styles.heroCol}>
          <Txt variant="small" color={colors.onBrandMuted}>
            {t('revenueTitle')}
          </Txt>
          <View style={styles.heroValue}>
            <Txt style={[styles.heroNumber, { color: colors.onBrand }]}>{statValue(stats?.receivedTotalTND)}</Txt>
            <Txt style={[styles.heroUnit, { color: colors.live }]}>{t('currency')}</Txt>
          </View>
        </View>
        <View style={[styles.heroLine, { backgroundColor: colors.onBrandLine }]} />
        <View style={styles.heroCol}>
          <Txt variant="small" color={colors.onBrandMuted}>
            {t('kpiCompleted')}
          </Txt>
          <Txt style={[styles.heroNumber, { color: colors.onBrand }]}>{statValue(stats?.totalCompletedMissions)}</Txt>
        </View>
      </View>

      <Surface>
        <View style={styles.row}>
          <StatCell label={t('revenueToday')} value={statValue(stats?.receivedTodayTND)} unit={t('currency')} />
          <View style={[styles.vLine, { backgroundColor: colors.border }]} />
          <StatCell label={t('revenueWeek')} value={statValue(stats?.receivedWeekTND)} unit={t('currency')} />
          <View style={[styles.vLine, { backgroundColor: colors.border }]} />
          <StatCell label={t('revenueMonth')} value={statValue(stats?.receivedMonthTND)} unit={t('currency')} />
        </View>
      </Surface>

      <MoneyCard stats={stats} />

      <Txt variant="overline" color={colors.textMuted} style={styles.cap}>
        {t('toTreat')}
      </Txt>
      <Surface>
        <TodoRow
          Icon={Wallet}
          label={t('kpiPendingTopups')}
          count={toNumber(stats?.pendingWireTransfers) ?? 0}
          onPress={() => onOpenTab('TOPUPS')}
        />
        <Hairline style={styles.sep} />
        <TodoRow
          Icon={ShieldCheck}
          label={t('adminVerifications')}
          count={toNumber(stats?.pendingVerifications) ?? 0}
          onPress={() => onOpenTab('VERIFICATIONS')}
        />
        <Hairline style={styles.sep} />
        <TodoRow
          Icon={AlertTriangle}
          label={t('adminDisputes')}
          count={toNumber(stats?.totalDisputes) ?? 0}
          onPress={() => onOpenTab('DISPUTES')}
        />
      </Surface>

      <Surface>
        <View style={styles.row}>
          <StatCell label={t('kpiActivePros')} value={statValue(stats?.activeProviders)} />
        </View>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  skeleton: { height: 220, borderRadius: 24 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 24 },
  heroCol: { flex: 1, minWidth: 0, gap: 4 },
  heroValue: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  heroNumber: { fontFamily: numeralFont, fontSize: 34, lineHeight: 38 },
  heroUnit: { fontFamily: numeralFont, fontSize: 16 },
  heroLine: { width: 1, alignSelf: 'stretch' },
  row: { flexDirection: 'row' },
  vLine: { width: 1 },
  cap: { paddingHorizontal: 2, paddingTop: 6, textTransform: 'uppercase' },
  sep: { marginStart: 64 },
  todo: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  tile: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  todoLabel: { flex: 1, fontSize: 15 },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontFamily: numeralFont, lineHeight: 16 },
});
