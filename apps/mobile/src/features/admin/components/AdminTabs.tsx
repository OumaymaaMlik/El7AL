import { Image, Text, View } from 'react-native';
import { Briefcase, Wallet } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { formatAmount, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { AdminMission, Topup } from '../schemas/admin.schema';
import { MissionList } from './MissionRows';
import { styles } from './AdminTabs.styles';

/** The receipt photo of a transfer, when the server sent one. */
const receiptOf = (topup: Topup): string | undefined => (topup as { receiptPhotoUrl?: string }).receiptPhotoUrl;

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

export { AnalyticsTab } from './AdminOverview';

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
              <Avatar
                name={topup.provider?.user?.fullName}
                size={44}
                tint={{ background: colors.brand, color: colors.live }}
              />
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
            </View>
            <View style={styles.between}>
              {Boolean(receiptOf(topup)) && (
                <Image
                  source={{ uri: receiptOf(topup) }}
                  style={[styles.receipt, { backgroundColor: colors.tint }]}
                  resizeMode="cover"
                />
              )}
              <View style={styles.flex}>
                <Txt variant="caption" color={colors.textMuted}>
                  {t('transferAmount')}
                </Txt>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {amount !== null ? formatAmount(amount) : String(topup.amount)}
                  <Text style={[styles.amountUnit, { color: colors.textSecondary }]}> {t('currency')}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.topupActions}>
              <Button
                title={t('reject')}
                variant="destructive"
                onPress={() => actions.reject(topup.id)}
                style={styles.flex}
              />
              <Button
                title={t('approve')}
                variant="primary"
                onPress={() => actions.approve(topup.id)}
                style={styles.flexWide}
              />
            </View>
          </Surface>
        );
      })}
    </View>
  );
}
