import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { TranslationKeys } from '../i18n/translations';
import { Txt } from './Txt';

/**
 * The El 7al signature element: the five steps of a mission as one rail.
 * Past steps are filled, the current step is taller and brighter, future steps are faint.
 * Draw it the same way everywhere a mission is shown (Home, Tracking, notifications).
 */

const STEPS: { key: TranslationKeys }[] = [
  { key: 'railRequested' },
  { key: 'railAccepted' },
  { key: 'railEnRoute' },
  { key: 'railInProgress' },
  { key: 'railDone' },
];

/** Maps a backend mission status to the index of the current step (0 to 4). */
export function missionStepIndex(status?: string | null): number {
  switch (status) {
    case 'ACCEPTED':
      return 1;
    case 'EN_ROUTE':
    case 'ARRIVED':
      return 2;
    case 'IN_PROGRESS':
      return 3;
    case 'DUAL_CONFIRM':
    case 'COMPLETED':
      return 4;
    default:
      return 0;
  }
}

interface MissionStatusRailProps {
  status?: string | null;
  /** Set when the rail sits on the brand-green panel. Otherwise it uses surface colours. */
  onBrand?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function MissionStatusRail({ status, onBrand = false, style }: MissionStatusRailProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const current = missionStepIndex(status);

  const filled = onBrand ? colors.action : colors.accentText;
  const empty = onBrand ? 'rgba(255, 255, 255, 0.24)' : colors.border;
  const labelDone = onBrand ? colors.onBrandMuted : colors.textSecondary;
  const labelCurrent = onBrand ? colors.onBrand : colors.text;
  const labelNext = onBrand ? colors.onBrandFaint : colors.textMuted;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${t('missionProgress')}: ${t(STEPS[current].key)}`}
      accessibilityValue={{ min: 0, max: STEPS.length - 1, now: current }}
      style={[styles.rail, style]}
    >
      {STEPS.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        return (
          <View key={step.key} style={styles.step}>
            <View
              style={[
                styles.bar,
                isCurrent && styles.barCurrent,
                { backgroundColor: isDone || isCurrent ? filled : empty },
              ]}
            />
            <Txt
              variant="overline"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              color={isCurrent ? labelCurrent : isDone ? labelDone : labelNext}
              style={language === 'ar' ? styles.labelArabic : styles.label}
            >
              {t(step.key)}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  step: {
    flex: 1,
    gap: 8,
  },
  bar: {
    height: 4,
    borderRadius: 2,
  },
  barCurrent: {
    height: 10,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelArabic: {
    fontSize: 11,
    lineHeight: 18,
  },
});
