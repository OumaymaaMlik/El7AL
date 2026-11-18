import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, I18nManager, Modal, StyleSheet, useWindowDimensions } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

interface Props {
  visible: boolean;
  /** Called by the hardware back button; the page then slides out once `visible` turns false. */
  onClose: () => void;
  children: React.ReactNode;
}

/** The prototype's easing: quick start, soft landing. */
const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * A full page that slides in from the edge (350 ms) over the one before it, and slides back out (300 ms),
 * like the prototype's forward and back transitions. It stays mounted while it leaves.
 */
export function SlideInPage({ visible, onClose, children }: Props) {
  const { width } = useWindowDimensions();
  const reduce = useReducedMotion();
  const off = I18nManager.isRTL ? -width : width;
  const x = useRef(new Animated.Value(off)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      x.setValue(reduce ? 0 : off);
      Animated.timing(x, { toValue: 0, duration: reduce ? 0 : 350, easing: EASE, useNativeDriver: true }).start();
    } else {
      Animated.timing(x, { toValue: off, duration: reduce ? 0 : 300, easing: EASE, useNativeDriver: true }).start(() =>
        setMounted(false),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: x }] }]}>{children}</Animated.View>
    </Modal>
  );
}
