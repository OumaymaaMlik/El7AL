import { ReportProblem } from './ReportProblem';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown, ChevronUp, MapPin, Phone } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { SectionHeader } from '../../../shared/ui/SectionHeader';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { TradeTile } from '../../home/components/TradeTile';
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
      <View style={styles.list}>
        {missions.length === 0 ? (
          <View style={[styles.padded, { borderColor: colors.border }, styles.emptyBox]}>
            <Txt variant="small" color={colors.textMuted} style={styles.center}>
              {t('emptyHistory')}
            </Txt>
          </View>
        ) : (
          missions.map((item) => {
            const expanded = expandedId === item.id;
            const badge = missionBadge(item.status, t);
            const clientPhone: string | undefined = item.client?.user?.phoneNumber ?? undefined;
            const clientName = item.client?.user?.fullName || t('client');
            const Chevron = expanded ? ChevronUp : ChevronDown;

            return (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.divider }]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityHint={expanded ? t('hideDetails') : t('showDetails')}
                  onPress={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
                >
                  <TradeTile name={item.category?.name} size={42} />
                  <View style={styles.flex}>
                    <Txt variant="bodyStrong" numberOfLines={1}>
                      {item.description || item.category?.name || t('historyShort')}
                    </Txt>
                    <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {[clientName, formatDate(item.createdAt, language)].join(' · ')}
                    </Txt>
                  </View>
                  <StatusBadge label={badge.label} tone={badge.tone} />
                  <Chevron size={18} color={colors.textMuted} />
                </Pressable>

                {expanded && (
                  <View style={[styles.details, { backgroundColor: colors.background }]}>
                    {Boolean(item.addressText) && (
                      <View style={styles.inline}>
                        <MapPin size={12} color={colors.textMuted} />
                        <Txt variant="small" color={colors.textSecondary} numberOfLines={2} style={styles.shrink}>
                          {item.addressText}
                        </Txt>
                      </View>
                    )}
                    {item.client?.user && <DetailLine label={t('clientLabel')} value={clientName} />}
                    {Boolean(item.description) && <DetailLine label={t('needLabel')} value={item.description!} />}
                    {item.review && (
                      <DetailLine
                        label={t('reviewLabel')}
                        value={[t('ratingOutOfFive').replace('{n}', String(item.review.rating)), item.review.comment]
                          .filter(Boolean)
                          .join(' · ')}
                      />
                    )}
                    {item.status === 'COMPLETED' && <ReportProblem missionId={item.id} />}
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
              </View>
            );
          })
        )}
      </View>
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
  list: { gap: 10 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  emptyBox: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 20 },
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  padded: { padding: space.lg, gap: space.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { minHeight: controlHeight, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14 },
  details: { paddingHorizontal: 14, paddingVertical: space.md, gap: space.sm },
  call: { marginTop: space.xs },
  detailLine: { flexDirection: 'row', gap: space.sm },
});
