import React from 'react';
import { Text, View } from 'react-native';
import { Briefcase, Wallet } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { StatCell } from '../../../shared/ui/StatCell';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { formatAmount, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { AdminMission, AdminStats, Topup } from '../schemas/admin.schema';
import { statValue } from '../utils/adminLabels';
import { MissionList } from './MissionRows';
import { styles } from './AdminTabs.styles';

/** Placeholder rows shown while a list loads for the first time. */
export function ListSkeleton() {
  return (
    <View style={styles.list}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} style={styles.skeletonRow} />
      ))}
    </View>
  );
}

export function AnalyticsTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  if (loading && !stats) return <Skeleton style={styles.skeletonPanel} />;
  return (
    <>
      <View>
        <SectionHeader title={t('revenueTitle')} meta={t('revenueHint')} />
        <Surface>
          <View style={styles.statRow}>
            <StatCell
              label={t('revenueTitle')}
              value={statValue(stats?.totalCommissionsCollectedTND)}
              unit={t('currency')}
            />
            <View style={[styles.vLine, { backgroundColor: colors.border }]} />
            <StatCell label={t('kpiCompleted')} value={statValue(stats?.totalCompletedMissions)} />
          </View>
          <Hairline />
          <View style={styles.statRow}>
            <StatCell label={t('revenueToday')} value={statValue(stats?.revenueTodayTND)} unit={t('currency')} />
            <View style={[styles.vLine, { backgroundColor: colors.border }]} />
            <StatCell label={t('revenueWeek')} value={statValue(stats?.revenueWeekTND)} unit={t('currency')} />
            <View style={[styles.vLine, { backgroundColor: colors.border }]} />
            <StatCell label={t('revenueMonth')} value={statValue(stats?.revenueMonthTND)} unit={t('currency')} />
          </View>
        </Surface>
      </View>
      <Surface>
        <View style={styles.statRow}>
          <StatCell label={t('kpiActivePros')} value={statValue(stats?.activeProviders)} />
          <View style={[styles.vLine, { backgroundColor: colors.border }]} />
          <StatCell label={t('adminVerifications')} value={statValue(stats?.pendingVerifications)} />
        </View>
        <Hairline />
        <View style={styles.statRow}>
          <StatCell label={t('kpiPendingTopups')} value={statValue(stats?.pendingWireTransfers)} />
          <View style={[styles.vLine, { backgroundColor: colors.border }]} />
          <StatCell label={t('adminDisputes')} value={statValue(stats?.totalDisputes)} />
        </View>
      </Surface>
    </>
  );
}

export function MissionsTab({
  missions,
  loading,
  onOpen,
}: {
  missions: AdminMission[];
  loading: boolean;
  onOpen: (m: AdminMission) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  if (loading && missions.length === 0) return <ListSkeleton />;
  if (missions.length === 0) {
    return (
      <Surface>
        <EmptyState icon={<Briefcase size={24} color={colors.textMuted} />} title={t('noInterventions')} />
      </Surface>
    );
  }
  return <MissionList missions={missions} onPress={onOpen} />;
}

export function TopupsTab({ topups, loading, actions }: { topups: Topup[]; loading: boolean; actions: AdminActions }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  if (loading && topups.length === 0) return <ListSkeleton />;
  if (topups.length === 0) {
    return (
      <Surface>
        <EmptyState icon={<Wallet size={24} color={colors.textMuted} />} title={t('noPendingTopups')} />
      </Surface>
    );
  }
  return (
    <View style={styles.list}>
      {topups.map((topup) => {
        const amount = toNumber(topup.amount);
        return (
          <Surface key={topup.id} style={styles.topupCard}>
            <View style={styles.between}>
              <View style={styles.flex}>
                {Boolean(topup.provider?.user?.fullName) && (
                  <Txt variant="bodyStrong" numberOfLines={1}>
                    {topup.provider?.user?.fullName}
                  </Txt>
                )}
                <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
                  {t('refShort').replace('{ref}', String(topup.uniqueRef ?? ''))}
                </Txt>
              </View>
              <Text style={[styles.amount, { color: colors.text }]}>
                {amount !== null ? formatAmount(amount) : String(topup.amount)}
                <Text style={[styles.amountUnit, { color: colors.textSecondary }]}> {t('currency')}</Text>
              </Text>
            </View>
            <View style={styles.topupActions}>
              <Button
                title={t('reject')}
                variant="outline"
                onPress={() => actions.reject(topup.id)}
                style={styles.flex}
              />
              <Button
                title={t('approve')}
                variant="primary"
                onPress={() => actions.approve(topup.id)}
                style={styles.flex}
              />
            </View>
          </Surface>
        );
      })}
    </View>
  );
}
