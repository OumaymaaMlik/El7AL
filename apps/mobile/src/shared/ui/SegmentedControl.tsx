import React from 'react';
import { Pressable, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { hitTarget, radius } from '../theme/tokens';
import { Txt } from './Txt';

interface SegmentedControlProps<T extends string> {
  options: { key: T; label: string; icon?: (color: string) => React.ReactNode }[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}

/** A row of mutually exclusive choices, for two to four short options. */
export function SegmentedControl<T extends string>({ options, value, onChange, style }: SegmentedControlProps<T>) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View accessibilityRole="radiogroup" style={[styles.track, { backgroundColor: colors.tint }, style]}>
      {options.map((option) => {
        const selected = option.key === value;
        const color = selected ? colors.onBrand : colors.text;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            style={[styles.segment, selected && { backgroundColor: colors.brand }]}
          >
            {option.icon?.(color)}
            <Txt variant="smallStrong" color={color} numberOfLines={1}>
              {option.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 8,
  },
});
