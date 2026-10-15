import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Switch } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useIsRTL } from '../store/useLanguageStore';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  /** Set when the toggle sits on the brand-green hero panel. */
  onBrand?: boolean;
  disabled?: boolean;
}

const TRACK_W = 50;
const TRACK_H = 30;
const THUMB = 24;
const TRAVEL = TRACK_W - THUMB - 6;

/**
 * The one on/off switch. iOS and Android get the system switch in the app's
 * colours; the web gets an equivalent control that also works right-to-left.
 */
export function Toggle({ value, onValueChange, accessibilityLabel, onBrand = false, disabled = false }: ToggleProps) {
  const colors = useThemeStore((state) => state.colors);
  const isRTL = useIsRTL();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: false }).start();
  }, [value, progress]);

  const offTrack = onBrand ? 'rgba(255, 255, 255, 0.3)' : colors.inputBorder;
  const onTrack = onBrand ? colors.action : colors.brand;

  if (Platform.OS !== 'web') {
    return (
      <Switch
        accessibilityLabel={accessibilityLabel}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: offTrack, true: onTrack }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={offTrack}
      />
    );
  }

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? onTrack : offTrack }, disabled && styles.disabled]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [
              { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, isRTL ? -TRAVEL : TRAVEL] }) },
            ],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
