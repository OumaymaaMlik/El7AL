import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeUp } from '../../../shared/ui/FadeUp';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { SegmentedControl } from '../../../shared/ui/SegmentedControl';
import { MissionStatusRail } from '../../../shared/ui/MissionStatusRail';
import { StatusBadge } from '../../../shared/ui/StatusBadge';
import { Txt } from '../../../shared/ui/Txt';
import { ToolIcon } from '../../../shared/ui/art/ToolIcon';
import { toolForCategory } from '../../../shared/ui/art/toolArt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { formatDate, missionBadge } from '../../../shared/utils/format';
import { TradeTile } from '../../home/components/TradeTile';
import type { Mission } from '../schemas/mission.schema';

type Filter = 'all' | 'ongoing' | 'done';

const isOngoing = (m: Mission) => m.status !== 'COMPLETED' && m.status !== 'CANCELLED';

/** A trade tile: the prototype's tool when one fits, else the category icon. */
function Tile({ mission, size, palette }: { mission: Mission; size: number; palette: 'light' | 'grey' }) {
  const colors = useThemeStore((s) => s.colors);
  const tool = toolForCategory(mission.category?.name, null);
  if (!tool) return <TradeTile name={mission.category?.name} size={size} />;
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size >= 46 ? 8 : 10, backgroundColor: colors.tint },
      ]}
    >
      <ToolIcon tool={tool} palette={palette} width={size * 0.44} height={size * 0.7} />
    </View>
  );
}

/**
 * "Mes demandes": the client's requests, the one under way first (framed in green with its steps), then the
 * finished ones by month. Three chips filter them.
 */
export function ClientRequests({ missions }: { missions: Mission[] }) {
  const colors = useThemeStore((s) => s.colors);
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');

  const ongoing = missions.filter(isOngoing);
  const done = missions.filter((m) => !isOngoing(m));

  const months = useMemo(() => {
    const groups: { key: string; label: string; items: Mission[] }[] = [];
    for (const m of done) {
      const d = new Date(m.createdAt ?? 0);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      let label = '';
      try {
        label = d.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-GB' : 'fr-FR', {
          month: 'long',
        });
      } catch {
        label = '';
      }
      const group = groups.find((g) => g.key === key);
      if (group) group.items.push(m);
      else groups.push({ key, label, items: [m] });
    }
    return groups;
  }, [done, language]);

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: t('requestsAll') },
    { id: 'ongoing', label: t('filterOngoing') },
    { id: 'done', label: t('filterDone') },
  ];

  const showOngoing = filter !== 'done';
  const showDone = filter !== 'ongoing';

  return (
    <View style={styles.wrap}>
      <SegmentedControl
        options={chips.map((c) => ({ key: c.id, label: c.label }))}
        value={filter}
        onChange={setFilter}
      />

      <View style={styles.list}>
        {showOngoing &&
          ongoing.map((m) => (
            <FadeUp key={m.id} style={[styles.active, { backgroundColor: colors.surface, borderColor: colors.brand }]}>
              <View style={styles.row}>
                <Tile mission={m} size={46} palette="light" />
                <View style={styles.flex}>
                  <Txt variant="bodyStrong" numberOfLines={1} style={styles.activeTitle}>
                    {m.description || m.category?.name}
                  </Txt>
                  <Txt variant="small" color={colors.textMuted} numberOfLines={1}>
                    {[m.category?.name, m.provider?.user?.fullName].filter(Boolean).join(' · ')}
                  </Txt>
                </View>
                <View style={styles.live}>
                  <LiveDot />
                  <Txt variant="captionStrong" color="#3F6212" numberOfLines={1}>
                    {missionBadge(m.status, t).label}
                  </Txt>
                </View>
              </View>
              <MissionStatusRail status={m.status} />
            </FadeUp>
          ))}

        {showDone &&
          months.map((g) => (
            <View key={g.key} style={styles.group}>
              <Txt variant="overline" color={colors.textMuted} style={styles.cap}>
                {g.label}
              </Txt>
              {g.items.map((m, i) => {
                const badge = missionBadge(m.status, t);
                return (
                  <FadeUp
                    key={m.id}
                    index={ongoing.length + i}
                    style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Tile mission={m} size={42} palette="grey" />
                    <View style={styles.flex}>
                      <Txt variant="bodyStrong" numberOfLines={1}>
                        {m.description || m.category?.name}
                      </Txt>
                      <Txt variant="caption" color={colors.textMuted} numberOfLines={1}>
                        {[m.category?.name, formatDate(m.createdAt, language)].filter(Boolean).join(' · ')}
                      </Txt>
                    </View>
                    <StatusBadge label={badge.label} tone={badge.tone} />
                  </FadeUp>
                );
              })}
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  wrap: { gap: 18 },
  list: { gap: 10 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  active: { borderWidth: 1.5, borderRadius: 24, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  activeTitle: { fontFamily: numeralFont, fontSize: 16, lineHeight: 21 },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(181,242,61,0.25)',
  },
  group: { gap: 10, paddingTop: 8 },
  cap: { paddingHorizontal: 2, textTransform: 'uppercase' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
});
