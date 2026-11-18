import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Colours and the 260 x 250 canvas shared by the four welcome illustrations. */

export const LIME = '#A3E635';
export const INK = '#06140D';
export const GLASS = '#DDE5DF';
export const GREY = '#A9B8AF';
export const W = 260;
const H = 250;

export const AnimatedPath = Animated.createAnimatedComponent(Path);

/** A transparent 260 x 250 layer that can carry a transform around a point given in canvas pixels. */
export function Layer({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
        {children}
      </Svg>
    </Animated.View>
  );
}

export function Canvas({ size, children }: { size: number; children: React.ReactNode }) {
  const scale = size / W;
  return (
    <View
      style={{ width: size, height: (size * H) / W }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={{ width: W, height: H, transform: [{ scale }], transformOrigin: 'top left' }}>{children}</View>
    </View>
  );
}
