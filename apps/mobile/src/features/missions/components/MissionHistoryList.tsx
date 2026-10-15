import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { controlHeight, space } from '../../../shared/theme/tokens';
import { formatDate, missionBadge } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { Mission } from '../schemas/mission.schema';

interface Props {
  missions: Mission[];
  onCall: (phone?: string | null) => void;
}

/** The artisan's past missions, each expandable to show its details. */
export function MissionHistoryList({ missions, onCall }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View>
      <SectionHeader title={t('historyTitle')} meta={missions.length > 0 ? String(missions.length) : undefined} />
      <Surface>
        {missions.length === 0 ? (
          <View style={styles.padded}>
            <Txt variant="small" color={colors.textMuted}>
              {t('emptyHistory')}
            </Txt>
          </View>
        ) : (
          missions.map((item, index) => {
            const expanded = expandedId === item.id;
            const badge = missionBadge(item.status, t);
            const clientPhone: string | undefined = item.client?.user?.phoneNumber ?? undefined;
            const Chevron = expanded ? ChevronUp : ChevronDown;

            return (
              <React.Fragment key={item.id}>
                {index > 0 && <Hairline />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityHint={expanded ? t('hideDetails') : t('showDetails')}
                  onPress={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
                >
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong" numberOfLines={1}>
                      {item.category?.name || t('historyShort')}
                    </Txt>
                    {Boolean(item.addressText) && (
                      <View style={styles.inline}>
                        <MapPin size={12} color={colors.textMuted} />
                        <Txt variant="small" color={colors.textSecondary} numberOfLines={1} style={styles.shrink}>
                          {item.addressText}
                        </Txt>
                      </View>
                    )}
                  </View>
                  <StatusBadge label={badge.label} tone={badge.tone} />
                  <Chevron size={18} color={colors.textMuted} />
                </Pressable>

                {expanded && (
                  <View style={[styles.details, { backgroundColor: colors.background }]}>
                    {item.client?.user && (
                      <DetailLine label={t('clientLabel')} value={item.client.user.fullName || t('client')} />
                    )}
                    {Boolean(item.description) && <DetailLine label={t('needLabel')} value={item.description!} />}
                    {item.review && (
                      <DetailLine
                        label={t('reviewLabel')}
                        value={[t('ratingOutOfFive').replace('{n}', String(item.review.rating)), item.review.comment]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                    )}
                    <DetailLine label={t('dateLabel')} value={formatDate(item.createdAt, language)} />
                    {Boolean(clientPhone) && (
                      <Button
                        title={`${t('callClientBtn')} (${clientPhone})`}
                        variant="outline"
                        onPress={() => onCall(clientPhone)}
                        iconPosition="left"
                        icon={<Phone size={16} color={colors.accentText} />}
                        style={styles.call}
                      />
                    )}
                  </View>
                )}
              </React.Fragment>
            );
          })
        )}
      </Surface>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={styles.detailLine}>
      <Txt variant="small" color={colors.textMuted}>
        {label}
      </Txt>
      <Txt variant="small" style={styles.flex}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  padded: { padding: space.lg, gap: space.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { minHeight: controlHeight, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14 },
  details: { paddingHorizontal: 14, paddingVertical: space.md, gap: space.sm },
  call: { marginTop: space.xs },
  detailLine: { flexDirection: 'row', gap: space.sm },
});
