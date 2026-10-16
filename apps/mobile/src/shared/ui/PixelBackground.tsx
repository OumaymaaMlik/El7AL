import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useThemeStore } from '../store/useThemeStore';
import { pixelPalette } from '../theme/artwork';
import { useReducedMotion } from './useReducedMotion';

const CELL = 22;
const SQUARE = 14;
/** Squares twinkle in three groups with different rhythms. */
const GROUP_MS = [3200, 4400, 5800];
const STILL_OPACITY = 0.55;

interface Square {
  x: number;
  y: number;
  color: string;
}

/** The same pattern every time: a fixed seed, so the background never jumps between visits. */
function buildGroups(width: number, height: number, palette: readonly string[]): Square[][] {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const groups: Square[][] = [[], [], []];
  const columns = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);
  let count = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = 6 + col * CELL;
      const y = 6 + row * CELL;
      // Denser near the left and right edges, so the middle stays calm for content.
      let chance = 0.07;
      if (x > width * 0.64) chance += 0.16;
      if (x < width * 0.18) chance += 0.1;
      if (Math.sin(y / 170) > 0.35) chance += 0.08;
      if (random() < chance) {
        groups[count % 3].push({ x, y, color: palette[Math.floor(random() * palette.length)] });
        count++;
      }
    }
  }
  return groups;
}

/**
 * The screen background of the access screens: a scatter of soft squares that twinkle. Decorative, so it
 * ignores touches and is hidden from screen readers. It stands still when the system asks for less motion.
 */
export function PixelBackground() {
  const { width, height } = useWindowDimensions();
  const mode = useThemeStore((state) => state.mode);
  const reduceMotion = useReducedMotion();
  const palette = pixelPalette[mode];
  const groups = useMemo(() => buildGroups(width, height, palette), [width, height, palette]);
  const opacity = useRef(GROUP_MS.map((_, i) => new Animated.Value(0.2 + i * 0.35))).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.forEach((value) => value.setValue(STILL_OPACITY));
      return;
    }
    const loops = opacity.map((value, i) => {
      const half = GROUP_MS[i] / 2;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: half,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.2,
            duration: half,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    });
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [reduceMotion, opacity]);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {groups.map((squares, index) => (
        <Animated.View key={index} style={[StyleSheet.absoluteFill, { opacity: opacity[index] }]}>
          <Svg width={width} height={height}>
            {squares.map((square) => (
              <Rect
                key={`${square.x}-${square.y}`}
                x={square.x}
                y={square.y}
                width={SQUARE}
                height={SQUARE}
                rx={2}
                fill={square.color}
              />
            ))}
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}
