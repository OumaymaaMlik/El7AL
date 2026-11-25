import { View } from 'react-native';
import { Briefcase, Wallet } from 'lucide-react-native';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Surface } from '../../../shared/ui/Surface';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';
import type { AdminMission, Topup } from '../schemas/admin.schema';
import { MissionList } from './MissionRows';
import { TopupCard } from './TopupCard';
import { RibCard } from './RibCard';
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
  const list = () => {
    if (loading && topups.length === 0) return <ListSkeleton />;
    if (topups.length === 0) {
      return (
        <Surface>
          <EmptyState icon={<Wallet size={24} color={colors.textMuted} />} title={t('noPendingTopups')} />
        </Surface>
      );
    }
    return topups.map((topup) => <TopupCard key={topup.id} topup={topup} actions={actions} />);
  };
  return (
    <View style={styles.list}>
      <RibCard />
      {list()}
    </View>
  );
}
