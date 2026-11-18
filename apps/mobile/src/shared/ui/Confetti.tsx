import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

const COLORS = ['#A3E635', '#2BB673', '#FFFFFF', '#CFE3D6', '#0D5C3A'];
const COUNT = 36;

interface Piece {
  dx: number;
  rise: number;
  fall: number;
  spin: number;
  w: number;
  h: number;
  color: string;
  round: boolean;
}

/**
 * A short burst of confetti from the middle (1.8 s), for the moment a job is paid and closed.
 * It ignores touches and does nothing when the system asks for less motion.
 */
export function Confetti() {
  const reduce = useReducedMotion();
  const p = useRef(new Animated.Value(0)).current;

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        dx: (Math.random() - 0.5) * 320,
        rise: 90 + Math.random() * 130,
        fall: 160 + Math.random() * 260,
        spin: (Math.random() - 0.5) * 900,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() < 0.3,
      })),
    [],
  );

  useEffect(() => {
    if (reduce) return;
    Animated.timing(p, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true }).start();
  }, [p, reduce]);

  if (reduce) return null;

  const opacity = p.interpolate({ inputRange: [0, 0.55, 1], outputRange: [1, 1, 0] });

  return (
    <View pointerEvents="none" style={styles.root}>
      {pieces.map((c, i) => (
        <Animated.View
          key={i}
          style={[
            styles.piece,
            {
              width: c.round ? c.w : c.w,
              height: c.round ? c.w : c.h,
              borderRadius: c.round ? c.w / 2 : 1,
              backgroundColor: c.color,
              opacity,
              transform: [
                { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, c.dx] }) },
                { translateY: p.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, -c.rise, c.fall] }) },
                { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${c.spin}deg`] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  piece: { position: 'absolute' },
});
