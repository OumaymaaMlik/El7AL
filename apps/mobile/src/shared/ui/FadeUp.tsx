import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

interface Props {
  /** Position in the list: each item starts 40 ms after the one before it (capped, so long lists do not drag). */
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** An item that fades in while rising 6 px, 250 ms, staggered by its place in the list (as the prototype's lists). */
export function FadeUp({ index = 0, style, children }: Props) {
  const reduce = useReducedMotion();
  const v = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, {
      toValue: 1,
      duration: 250,
      delay: Math.min(index, 10) * 40,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [index, reduce, v]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  return <Animated.View style={[{ opacity: v, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}
