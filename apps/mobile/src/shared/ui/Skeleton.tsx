import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { radius } from '../theme/tokens';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * A placeholder block shown while content loads. Give it the size of the thing
 * it stands in for, so the layout does not jump when the content arrives.
 */
export function Skeleton({ style }: SkeletonProps) {
  const colors = useThemeStore((state) => state.colors);
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ backgroundColor: colors.raised, borderRadius: radius.sm, opacity: pulse }, style]}
    />
  );
}
