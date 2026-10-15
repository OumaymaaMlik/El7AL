import React from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { Briefcase, ChevronLeft } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { IconButton } from '../../../shared/ui/IconButton';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { UserInterventions } from '../hooks/useUserInterventions';
import { ListSkeleton } from './AdminTabs';
import { MissionDetail, MissionList } from './MissionRows';

/** A user's missions, or the details of one mission, in a single bottom sheet. */
export function UserInterventionsSheet({ state }: { state: UserInterventions }) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <BottomSheet
      visible={state.visible}
      onClose={state.close}
      title={state.showingDetail ? t('interventionDetails') : state.user?.fullName || t('interventions')}
      subtitle={
        state.showingDetail
          ? t('refShort').replace('{ref}', String(state.detail?.id || '').slice(0, 8))
          : t('userInterventionsSub')
      }
      headerAction={
        state.canGoBack ? (
          <IconButton
            accessibilityLabel={t('back')}
            onPress={state.backToList}
            style={{ backgroundColor: colors.raised, borderWidth: 0 }}
          >
            <Mirrored>
              <ChevronLeft size={18} color={colors.text} />
            </Mirrored>
          </IconButton>
        ) : undefined
      }
    >
      <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
        {state.detail ? (
          <MissionDetail mission={state.detail} />
        ) : state.loading ? (
          <ListSkeleton />
        ) : state.missions.length === 0 ? (
          <EmptyState icon={<Briefcase size={24} color={colors.textMuted} />} title={t('noUserMissions')} />
        ) : (
          <MissionList missions={state.missions} onPress={state.openDetail} flat />
        )}
      </ScrollView>
    </BottomSheet>
  );
}
