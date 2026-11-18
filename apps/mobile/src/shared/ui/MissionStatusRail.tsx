import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { TranslationKeys } from '../i18n/translations';
import { Txt } from './Txt';

/**
 * The El 7al signature element: the six steps of a mission as one rail of segments.
 * Past steps are filled, the current step is half filled, future steps are faint, and
 * one line under the rail names the current step and counts them ("En route · 3 / 6").
 * Draw it the same way everywhere a mission is shown (Home, Tracking, notifications).
 */

const STEPS: { key: TranslationKeys }[] = [
  { key: 'railRequested' },
  { key: 'railAccepted' },
  { key: 'railEnRoute' },
  { key: 'railArrived' },
  { key: 'railInProgress' },
  { key: 'railDone' },
];

/** Maps a backend mission status to the index of the current step (0 to 5). */
function missionStepIndex(status?: string | null): number {
  switch (status) {
    case 'ACCEPTED':
      return 1;
    case 'EN_ROUTE':
      return 2;
    case 'ARRIVED':
      return 3;
    case 'IN_PROGRESS':
      return 4;
    case 'DUAL_CONFIRM':
    case 'COMPLETED':
      return 5;
    default:
      return 0;
  }
}

interface MissionStatusRailProps {
  status?: string | null;
  /** Set when the rail sits on the hero panel. Otherwise it uses surface colours. */
  onBrand?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MissionStatusRail({ status, onBrand = false, style }: MissionStatusRailProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const current = missionStepIndex(status);

  const filled = onBrand ? colors.live : colors.accentText;
  const empty = onBrand ? 'rgba(255, 255, 255, 0.18)' : colors.border;
  const label = onBrand ? colors.onBrandMuted : colors.textSecondary;
  const count = onBrand ? colors.onBrandFaint : colors.textMuted;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${t('missionProgress')}: ${t(STEPS[current].key)}`}
      accessibilityValue={{ min: 0, max: STEPS.length - 1, now: current }}
      style={style}
    >
      <View style={styles.rail}>
        {STEPS.map((step, index) => {
          const isDone = index < current;
          const isCurrent = index === current;
          return (
            <View key={step.key} style={[styles.segment, { backgroundColor: empty }]}>
              {(isDone || isCurrent) && (
                <View style={[styles.fill, { backgroundColor: filled, width: isCurrent ? '50%' : '100%' }]} />
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.caption}>
        <Txt variant="caption" color={label} numberOfLines={1} style={styles.captionLabel}>
          {t(STEPS[current].key)}
        </Txt>
        <Txt variant="caption" color={count}>
          {current + 1} / {STEPS.length}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  caption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  captionLabel: { flexShrink: 1 },
});
