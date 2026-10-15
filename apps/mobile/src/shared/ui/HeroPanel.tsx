import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { numeralFont } from '../theme/typography';
import { radius, space } from '../theme/tokens';
import { LiveDot } from './LiveDot';
import { Txt } from './Txt';

/**
 * Building blocks for the brand-green hero at the top of Home (and, later, Tracking).
 * There is one hero per screen. It always answers "what is happening now and what
 * is the one thing to do next".
 */

export function HeroPanel({ style, children, ...rest }: ViewProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View {...rest} style={[styles.panel, { backgroundColor: colors.brand }, style]}>
      {children}
    </View>
  );
}

interface HeroStatusProps {
  /** Status label, shown as a condensed uppercase line. */
  label: string;
  /** Pulsing dot for live states. Without it a static square marker is shown. */
  live?: boolean;
  /** Optional content on the trailing side (a distance, a timer, a tag). */
  trailing?: React.ReactNode;
}

export function HeroStatus({ label, live = false, trailing }: HeroStatusProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusLabel}>
        {live ? <LiveDot /> : <View style={[styles.marker, { backgroundColor: colors.action }]} />}
        <Txt variant="overline" color={colors.onBrandMuted} numberOfLines={1} style={styles.flexShrink}>
          {label}
        </Txt>
      </View>
      {trailing}
    </View>
  );
}

/** A large condensed numeral with a small unit, e.g. "8 min" or "32 s". */
export function HeroNumeral({ value, unit, size = 44 }: { value: string | number; unit?: string; size?: number }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View style={styles.numeralRow}>
      <Text style={[styles.numeral, { color: colors.onBrand, fontSize: size, lineHeight: size + 2 }]}>{value}</Text>
      {Boolean(unit) && (
        <Text
          style={[styles.numeral, { color: colors.onBrand, fontSize: Math.round(size * 0.5), lineHeight: size + 2 }]}
        >
          {unit}
        </Text>
      )}
    </View>
  );
}

export function HeroAddress({ address }: { address?: string | null }) {
  const colors = useThemeStore((state) => state.colors);
  if (!address) return null;
  return (
    <View style={styles.addressRow}>
      <MapPin size={15} color={colors.onBrand} />
      <Txt variant="smallStrong" color={colors.onBrand} numberOfLines={1} style={styles.flexShrink}>
        {address}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    padding: 22,
    gap: space.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  marker: {
    width: 8,
    height: 8,
  },
  flexShrink: {
    flexShrink: 1,
  },
  numeralRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  numeral: {
    fontFamily: numeralFont,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
