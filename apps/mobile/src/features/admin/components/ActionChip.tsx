import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';

interface ActionChipProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  /** 'confirm' fills with the brand green; 'danger' uses the danger text colour. */
  tone?: 'default' | 'confirm' | 'danger';
}

/** A compact labelled action for a list row, still a full 44pt touch target. */
export function ActionChip({ label, icon, onPress, tone = 'default' }: ActionChipProps) {
  const colors = useThemeStore((state) => state.colors);
  const textColor = tone === 'confirm' ? colors.onBrand : tone === 'danger' ? colors.dangerText : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        tone === 'confirm'
          ? { backgroundColor: colors.brand, borderColor: colors.brand }
          : { backgroundColor: 'transparent', borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      {icon}
      <Txt variant="smallStrong" color={textColor} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
