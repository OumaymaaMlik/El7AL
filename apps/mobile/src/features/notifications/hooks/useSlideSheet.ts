import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const OFFSCREEN = 600;

/** Slides a bottom sheet in when `visible` turns true; `close()` slides it out, then calls `onClosed`. */
export function useSlideSheet(visible: boolean, onClosed: () => void, onOpen?: () => void) {
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;

  useEffect(() => {
    if (!visible) return;
    onOpen?.();
    translateY.setValue(OFFSCREEN);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, translateY]);

  const close = () =>
    Animated.timing(translateY, {
      toValue: OFFSCREEN,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClosed());

  return { translateY, close };
}
