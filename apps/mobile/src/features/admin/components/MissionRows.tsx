import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Clock, Star } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { formatDate, missionBadge, toNumber } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminMission } from '../schemas/admin.schema';
import { commissionOf } from '../utils/adminLabels';

/** One mission in a list; tapping opens its details. */
export function MissionRow({ mission, onPress }: { mission: AdminMission; onPress: (m: AdminMission) => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const badge = missionBadge(mission.status, t);
  const commission = commissionOf(mission, t);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mission.category?.name || t('fieldService')}, ${mission.addressText || ''}`}
      onPress={() => onPress(mission)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
    >
      <View style={styles.body}>
        <View style={styles.between}>
          <Txt variant="bodyStrong" numberOfLines={1} style={styles.flex}>
            {mission.category?.name || t('fieldService')}
          </Txt>
          <StatusBadge label={badge.label} tone={badge.tone} />
        </View>
        {Boolean(mission.addressText) && (
          <Txt variant="small" color={colors.textSecondary} numberOfLines={2}>
            {mission.addressText}
          </Txt>
        )}
        <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
          {t('client')} · {mission.client?.user?.fullName || t('notSpecified')}
        </Txt>
        <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
          {t('artisanLabel')} · {mission.provider?.user?.fullName || t('notAssigned')}
        </Txt>
        {(Boolean(mission.durationMinutes) || commission) && (
          <View style={styles.meta}>
            {Boolean(mission.durationMinutes) && (
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.textMuted} />
                <Txt variant="caption" color={colors.textSecondary}>
                  {mission.durationMinutes} {t('minutesShort')}
                </Txt>
              </View>
            )}
            {commission && (
              <Txt variant="caption" color={colors.textSecondary}>
                {t('revenueLabel')} · {commission}
              </Txt>
            )}
          </View>
        )}
      </View>
      <Mirrored>
        <ChevronRight size={18} color={colors.textMuted} />
      </Mirrored>
    </Pressable>
  );
}

/** A bordered list of missions. */
export function MissionList({
  missions,
  onPress,
  flat,
}: {
  missions: AdminMission[];
  onPress: (m: AdminMission) => void;
  flat?: boolean;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Surface style={flat ? { backgroundColor: colors.background } : undefined}>
      {missions.map((m, index) => (
        <React.Fragment key={m.id}>
          {index > 0 && <Hairline />}
          <MissionRow mission={m} onPress={onPress} />
        </React.Fragment>
      ))}
    </Surface>
  );
}

/** Label/value table with everything the admin needs to know about one mission. */
export function MissionDetail({ mission }: { mission: AdminMission }) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const badge = missionBadge(mission.status, t);
  const commission = commissionOf(mission, t);
  const rating = toNumber(mission.review?.rating);
  const created = formatDate(mission.createdAt, language);

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('fieldService'), value: mission.category?.name || t('notSpecified') },
    { label: t('statusLabel'), value: <StatusBadge label={badge.label} tone={badge.tone} /> },
    { label: t('fieldAddress'), value: mission.addressText || t('notSpecified') },
    {
      label: t('client'),
      value:
        [mission.client?.user?.fullName, mission.client?.user?.phoneNumber].filter(Boolean).join(' · ') ||
        t('notSpecified'),
    },
    {
      label: t('artisanLabel'),
      value:
        [mission.provider?.user?.fullName, mission.provider?.user?.phoneNumber].filter(Boolean).join(' · ') ||
        t('notAssigned'),
    },
  ];
  if (created) rows.push({ label: t('dateShort'), value: created });
  if (mission.durationMinutes) {
    rows.push({ label: t('executionTime'), value: `${mission.durationMinutes} ${t('minutesShort')}` });
  }
  if (commission) rows.push({ label: t('revenueLabel'), value: commission });
  if (rating !== null) {
    rows.push({
      label: t('reviewShort'),
      value: (
        <View style={styles.reviewValue}>
          <View style={styles.metaItem}>
            <Star size={14} color={colors.star} fill={colors.star} />
            <Txt variant="smallStrong">{t('ratingOutOfFive').replace('{n}', String(rating))}</Txt>
          </View>
          {Boolean(mission.review?.comment) && (
            <Txt variant="small" color={colors.textSecondary}>
              {mission.review?.comment}
            </Txt>
          )}
        </View>
      ),
    });
  }

  return (
    <Surface style={{ backgroundColor: colors.background }}>
      {rows.map((row, index) => (
        <React.Fragment key={row.label}>
          {index > 0 && <Hairline />}
          <View style={styles.detailRow}>
            <Txt variant="small" color={colors.textMuted} style={styles.detailLabel}>
              {row.label}
            </Txt>
            <View style={styles.flex}>
              {typeof row.value === 'string' ? <Txt variant="small">{row.value}</Txt> : row.value}
            </View>
          </View>
        </React.Fragment>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  body: { flex: 1, gap: 4 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, padding: space.lg },
  detailLabel: { width: 96 },
  reviewValue: { gap: space.xs },
});
