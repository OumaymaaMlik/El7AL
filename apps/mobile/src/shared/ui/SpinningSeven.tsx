import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { artwork } from '../theme/artwork';
import { useReducedMotion } from './useReducedMotion';

const SHAPE = 'M4 4h68v19L39 128H15l34-102H4z';
const TOP_BAR = 'M4 4h68v6H4z';
const VIEW_W = 76;
const VIEW_H = 132;
const STEPS = 32;
const POINTS = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);
/** Depth of each thin slice that makes the side of the 7 (in artwork units). */
const SIDE_DEPTHS = [-5, -3, -1, 1, 3, 5];
const FACE_DEPTH = 7;
/** The pose shown when motion is reduced: turned a little so the thickness shows. */
const STILL_POSE = 0.06;

interface SpinningSevenProps {
  /** Width in points; the height follows the artwork's proportions. */
  width?: number;
}

/**
 * The "7" of the name, turning on its axis. React Native has no 3D scene, so the turn is drawn as
 * a stack of slices: each slice slides sideways with the sine of the angle (the thickness) and the
 * whole stack is squeezed with the cosine (the turn). Negative squeezing mirrors the 7, which is
 * exactly what its back looks like. Everything runs on the native driver.
 */
export function SpinningSeven({ width = VIEW_W }: SpinningSevenProps) {
  const scale = width / VIEW_W;
  const height = VIEW_H * scale;
  const reduceMotion = useReducedMotion();
  const turn = useRef(new Animated.Value(STILL_POSE)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      turn.setValue(STILL_POSE);
      bob.setValue(0);
      return;
    }
    turn.setValue(0);
    const spin = Animated.loop(
      Animated.timing(turn, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true }),
    );
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    spin.start();
    float.start();
    return () => {
      spin.stop();
      float.stop();
    };
  }, [reduceMotion, turn, bob]);

  const motion = useMemo(() => {
    const curve = (fn: (angle: number) => number) =>
      turn.interpolate({ inputRange: POINTS, outputRange: POINTS.map((p) => fn(p * 2 * Math.PI)) });
    return {
      squeeze: curve(Math.cos),
      frontOpacity: curve((a) => (Math.cos(a) > 0.02 ? 1 : 0)),
      backOpacity: curve((a) => (Math.cos(a) < -0.02 ? 1 : 0)),
      shift: (depth: number) => curve((a) => depth * scale * Math.sin(a)),
    };
  }, [turn, scale]);

  const floatY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8 * scale] });

  const slice = (key: string, depth: number, fill: string, opacity?: Animated.AnimatedInterpolation<number>) => (
    <Animated.View
      key={key}
      style={[
        StyleSheet.absoluteFill,
        opacity ? { opacity } : null,
        { transform: [{ translateX: motion.shift(depth) }, { scaleX: motion.squeeze }] },
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Path d={SHAPE} fill={fill} />
        {fill === artwork.sevenFront && <Path d={TOP_BAR} fill={artwork.sevenTop} />}
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, transform: [{ translateY: floatY }] }}
    >
      {SIDE_DEPTHS.map((depth) => slice(`side${depth}`, depth, artwork.sevenSide))}
      {slice('front', FACE_DEPTH, artwork.sevenFront, motion.frontOpacity)}
      {slice('back', -FACE_DEPTH, artwork.sevenBack, motion.backOpacity)}
    </Animated.View>
  );
}
