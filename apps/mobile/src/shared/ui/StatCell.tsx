import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { numeralFont } from '../theme/typography';
import { space } from '../theme/tokens';
import { Txt } from './Txt';

/** Shown in place of a figure that is not available. Never invent a number. */
export const EMPTY_VALUE = '—';

interface StatCellProps {
  label: string;
  /** The figure, already formatted. Pass `EMPTY_VALUE` when there is none. */
  value: string;
  unit?: string;
  hint?: string;
  /** A small element after the figure, such as a star. */
  adornment?: React.ReactNode;
}

/**
 * One figure in a stat panel: a quiet label, a large condensed numeral, an optional
 * unit and hint. Put two per row inside a `Surface`, divided by hairlines.
 */
export function StatCell({ label, value, unit, hint, adornment }: StatCellProps) {
  const colors = useThemeStore((state) => state.colors);
  const isEmpty = value === EMPTY_VALUE;
  return (
    <View
      style={styles.cell}
      accessible
      accessibilityLabel={`${label}: ${isEmpty ? '' : value} ${unit ?? ''} ${hint ?? ''}`}
    >
      <Txt variant="small" color={colors.textMuted} numberOfLines={2}>
        {label}
      </Txt>
      <View style={styles.valueRow}>
        <Text style={[styles.value, isEmpty && styles.valueEmpty, { color: isEmpty ? colors.textMuted : colors.text }]}>
          {value}
        </Text>
        {Boolean(unit) && <Text style={[styles.unit, { color: colors.textSecondary }]}>{unit}</Text>}
        {adornment}
      </View>
      {Boolean(hint) && (
        <Txt variant="caption" color={colors.textMuted} numberOfLines={2}>
          {hint}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    padding: space.lg,
    gap: space.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  value: {
    fontFamily: numeralFont,
    fontSize: 44,
    lineHeight: 46,
  },
  valueEmpty: {
    fontSize: 28,
  },
  unit: {
    fontFamily: numeralFont,
    fontSize: 22,
    lineHeight: 46,
  },
});
