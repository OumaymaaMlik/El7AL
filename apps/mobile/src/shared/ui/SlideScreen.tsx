import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

const LeaveContext = createContext<(then: () => void) => void>((then) => then());

/** Lets a screen slide out before it goes back: `leave(() => router.back())`. Outside a SlideScreen it just runs. */
export const useSlideLeave = () => useContext(LeaveContext);

interface SlideScreenProps {
  children: React.ReactNode;
  /** False for the first screen of the app, which should not slide in. */
  enter?: boolean;
}

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

/**
 * The page-to-page slide of the prototype: a new screen slides in from the right over the page colour, and
 * slides back out to the right when the person goes back. Phones already animate the stack natively, so
 * this only acts on the web, where the stack changes screens with no motion.
 */
export function SlideScreen({ children, enter = true }: SlideScreenProps) {
  const { width } = useWindowDimensions();
  const colors = useThemeStore((state) => state.colors);
  const web = Platform.OS === 'web';
  const x = useRef(new Animated.Value(web && enter ? width : 0)).current;

  useEffect(() => {
    if (!web || !enter) return;
    Animated.timing(x, { toValue: 0, duration: 350, easing: EASE, useNativeDriver: true }).start();
  }, [web, enter, x]);

  const leave = useCallback(
    (then: () => void) => {
      if (!web) {
        then();
        return;
      }
      Animated.timing(x, { toValue: width, duration: 300, easing: EASE, useNativeDriver: true }).start(() => then());
    },
    [web, width, x],
  );

  return (
    <LeaveContext.Provider value={leave}>
      <Animated.View
        style={[
          styles.fill,
          web && styles.edge,
          { backgroundColor: colors.background, transform: [{ translateX: x }] },
        ]}
      >
        {children}
      </Animated.View>
    </LeaveContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // A soft edge so the sliding page reads as lying on top of the one underneath.
  edge: { boxShadow: '-12px 0 24px rgba(11, 31, 22, 0.18)' } as object,
});
