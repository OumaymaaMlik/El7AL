import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from '../useReducedMotion';

interface LoopOptions {
  /** Milliseconds before the first run (CSS `animation-delay`). It is not repeated on later runs. */
  delay?: number;
  easing?: (value: number) => number;
  /** Run once and stay at 1 (CSS `forwards`) instead of repeating. */
  once?: boolean;
  /** Set to false to keep the value at 0. */
  enabled?: boolean;
  /** Use the JS driver (needed for SVG props such as strokeDashoffset). */
  js?: boolean;
}

/**
 * A 0 to 1 value that repeats forever, like a CSS keyframe animation. Interpolate it to draw the keyframes.
 * It stands still at 0 when the system asks for less motion.
 */
export function useLoop(
  duration: number,
  { delay = 0, easing = Easing.linear, once = false, enabled = true, js = false }: LoopOptions = {},
) {
  const value = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !enabled) {
      // A run-once animation rests on its last frame; a loop rests on its first.
      value.setValue(reduced && once ? 1 : 0);
      return;
    }
    value.setValue(0);
    const run = Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: !js });
    const anim = once
      ? Animated.sequence([Animated.delay(delay), run])
      : Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([run, Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: !js })]),
          ),
        ]);
    anim.start();
    return () => anim.stop();
  }, [value, reduced, enabled, duration, delay, easing, once, js]);

  return value;
}

/** Interpolates a loop value through CSS-style keyframes: `[[0, a], [0.4, b], [1, c]]`. */
export function keyframes(value: Animated.Value, frames: [number, number | string][], easing?: (v: number) => number) {
  return value.interpolate({
    inputRange: frames.map((f) => f[0]),
    outputRange: frames.map((f) => f[1]) as number[] | string[],
    ...(easing ? { easing } : {}),
  });
}
