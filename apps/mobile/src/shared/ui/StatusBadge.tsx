import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, X, Clock } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { radius } from '../theme/tokens';
import { BadgeTone } from '../utils/format';
import { Txt } from './Txt';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Pass 'none' for a plain tag without a status icon. */
  icon?: 'auto' | 'none';
}

/**
 * A small status tag for list rows. Each tone has its own icon as well as its own
 * colour, so the status never depends on colour alone.
 */
export function StatusBadge({ label, tone = 'neutral', icon = 'auto' }: StatusBadgeProps) {
  const colors = useThemeStore((state) => state.colors);

  const color = tone === 'success' ? colors.accentText : tone === 'danger' ? colors.dangerText : colors.textSecondary;
  const background = tone === 'danger' ? colors.dangerSoft : colors.raised;
  const Icon = tone === 'success' ? Check : tone === 'danger' ? X : Clock;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      {icon === 'auto' && <Icon size={12} color={color} strokeWidth={2.6} />}
      <Txt variant="captionStrong" color={color} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
