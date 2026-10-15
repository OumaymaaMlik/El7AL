import React, { useCallback, useEffect, useState } from 'react';
import type { Mission } from '../../missions/schemas/mission.schema';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Clock, ChevronLeft, ChevronRight, User, Wrench } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { IconButton } from '../../../shared/ui/IconButton';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Surface, Hairline } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { formatDate, missionBadge } from '../../../shared/utils/format';
import { space } from '../../../shared/theme/tokens';
import { api } from '../../../services/http/client';
import { logger } from '../../../shared/utils/logger';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  userRole: 'CLIENT' | 'PROVIDER';
}

/** The list of past and current missions, with a detail view for each. */
export function HistoryModal({ visible, onClose, userRole }: HistoryModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/missions/history?role=${userRole}`);
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      logger.warn('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (visible) {
      fetchHistory();
      setSelectedMission(null);
    }
  }, [visible, fetchHistory]);

  if (!visible) return null;

  const isClient = userRole === 'CLIENT';
  const otherPartyName = (mission: Mission) =>
    isClient ? mission.provider?.user?.fullName : mission.client?.user?.fullName;

  const renderBody = () => {
    if (loading) {
      return (
        <Surface>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              {i > 0 && <Hairline />}
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Skeleton style={{ width: '55%', height: 16 }} />
                  <Skeleton style={{ width: '35%', height: 12, marginTop: 8 }} />
                </View>
                <Skeleton style={{ width: 72, height: 22 }} />
              </View>
            </React.Fragment>
          ))}
        </Surface>
      );
    }

    if (selectedMission) {
      const badge = missionBadge(selectedMission.status, t);
      const review = selectedMission.review;
      return (
        <Surface>
          <DetailRow label={t('statusLabel')}>
            <StatusBadge label={badge.label} tone={badge.tone} />
          </DetailRow>
          <Hairline />
          <DetailRow label={t('dateShort')} value={formatDate(selectedMission.createdAt, language)} />
          <Hairline />
          <DetailRow label={t('fieldAddress')} value={selectedMission.addressText || t('notSpecified')} />
          <Hairline />
          <DetailRow
            label={isClient ? t('artisanLabel') : t('client')}
            value={otherPartyName(selectedMission) || (isClient ? t('notAssigned') : t('client'))}
          />
          {review && (
            <>
              <Hairline />
              <DetailRow
                label={t('reviewShort')}
                value={[t('ratingOutOfFive').replace('{n}', String(review.rating)), review.comment]
                  .filter(Boolean)
                  .join(' · ')}
              />
            </>
          )}
        </Surface>
      );
    }

    if (history.length === 0) {
      return <EmptyState icon={<Clock size={24} color={colors.textMuted} />} title={t('noInterventions')} />;
    }

    return (
      <Surface>
        {history.map((item, index) => {
          const badge = missionBadge(item.status, t);
          const name = otherPartyName(item);
          return (
            <React.Fragment key={item.id}>
              {index > 0 && <Hairline />}
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedMission(item)}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
              >
                <View style={styles.flex}>
                  <Txt variant="bodyStrong" numberOfLines={1}>
                    {item.category?.name || capitalizeFirst(t('interventions'))}
                  </Txt>
                  <View style={styles.meta}>
                    {isClient ? (
                      <Wrench size={12} color={colors.textMuted} />
                    ) : (
                      <User size={12} color={colors.textMuted} />
                    )}
                    <Txt variant="small" color={colors.textSecondary} numberOfLines={1} style={styles.flexShrink}>
                      {[name, formatDate(item.createdAt, language)].filter(Boolean).join(' · ')}
                    </Txt>
                  </View>
                </View>
                <StatusBadge label={badge.label} tone={badge.tone} />
                <Mirrored>
                  <ChevronRight size={18} color={colors.textMuted} />
                </Mirrored>
              </Pressable>
            </React.Fragment>
          );
        })}
      </Surface>
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={selectedMission ? t('interventionDetails') : t('historyTitle')}
      headerAction={
        selectedMission ? (
          <IconButton
            accessibilityLabel={t('back')}
            onPress={() => setSelectedMission(null)}
            style={{ backgroundColor: colors.raised, borderWidth: 0 }}
          >
            <Mirrored>
              <ChevronLeft size={20} color={colors.text} />
            </Mirrored>
          </IconButton>
        ) : undefined
      }
    >
      <ScrollView style={{ maxHeight: height * 0.6 }} showsVerticalScrollIndicator={false}>
        {renderBody()}
      </ScrollView>
    </BottomSheet>
  );
}

function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={styles.detailRow}>
      <Txt variant="small" color={colors.textMuted} style={styles.detailLabel}>
        {label}
      </Txt>
      {children ?? (
        <View style={styles.detailValue}>
          <Txt variant="bodyMedium">{value}</Txt>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: 14,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    padding: 14,
  },
  detailLabel: {
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
});
