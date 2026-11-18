import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { numeralFont } from '../../theme/typography';
import { keyframes, useLoop } from './useLoop';
import { LIME } from './slideKit';

/* ---------------------------------------------------------------- 1. orbit */

const ORBIT = 240;
const ICON_STROKE = {
  fill: 'none',
  stroke: LIME,
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;
const TOOL_ICONS: React.ReactNode[] = [
  <Path
    key="0"
    d="M14.5 3a4.5 4.5 0 0 0-3.9 6.7L3 17.3 6.7 21l7.6-7.6A4.5 4.5 0 0 0 21 9.5l-3 3-3-1-1-3 3-3A4.5 4.5 0 0 0 14.5 3z"
    {...ICON_STROKE}
  />,
  <Path key="1" d="M14 4l6 6-2.5 2.5-6-6zM11.5 7.5L4 15v5h5l7.5-7.5" {...ICON_STROKE} />,
  <G key="2">
    <Circle cx="12" cy="12" r="3.5" {...ICON_STROKE} />
    <Path
      d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"
      {...ICON_STROKE}
    />
  </G>,
  <G key="3">
    <Path d="M4 18a8 8 0 1 1 16 0M12 18l4-5" {...ICON_STROKE} />
    <Circle cx="12" cy="18" r="1" {...ICON_STROKE} />
  </G>,
  <G key="4">
    <Circle cx="8" cy="15" r="4" {...ICON_STROKE} />
    <Path d="M11 12l9-9M16 7l3 3" {...ICON_STROKE} />
  </G>,
  <G key="5">
    <Rect x="4" y="3" width="14" height="5" rx="1.5" {...ICON_STROKE} />
    <Path d="M18 5.5h2V11H11v3" {...ICON_STROKE} />
    <Rect x="9" y="14" width="4" height="7" rx="1" {...ICON_STROKE} />
  </G>,
];
const TILE_POS: [number, number][] = [
  [120, 20],
  [206, 70],
  [206, 170],
  [120, 220],
  [34, 170],
  [34, 70],
];

function OrbitTile({
  index,
  unspin,
  active,
}: {
  index: number;
  unspin: Animated.AnimatedInterpolation<string>;
  active: boolean;
}) {
  const pop = useLoop(4800, { delay: index * 800, easing: Easing.inOut(Easing.quad), enabled: active });
  // tpop: rest, then a quick 22% swell with a tilt at 70 to 86 percent of each 4.8 s turn.
  const scale = keyframes(pop, [
    [0, 1],
    [0.7, 1],
    [0.78, 1.22],
    [0.86, 1],
    [1, 1],
  ]);
  const rotate = keyframes(pop, [
    [0, '0deg'],
    [0.7, '0deg'],
    [0.78, '-8deg'],
    [0.86, '0deg'],
    [1, '0deg'],
  ]);
  return (
    <View style={[styles.tileSlot, { left: TILE_POS[index][0] - 20, top: TILE_POS[index][1] - 20 }]}>
      <Animated.View style={[styles.tile, { transform: [{ rotate: unspin }] }]}>
        <Animated.View style={{ transform: [{ scale }, { rotate }] }}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            {TOOL_ICONS[index]}
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export function OrbitSlide({ size = ORBIT, active = true }: { size?: number; active?: boolean }) {
  const entry = useLoop(700, { once: true, easing: Easing.bezier(0.2, 0.9, 0.3, 1.25), enabled: active });
  const spin = useLoop(40000, { enabled: active });
  const ringSpin = useLoop(60000, { enabled: active });
  const breathe = useLoop(3200, { easing: Easing.inOut(Easing.quad), enabled: active });
  const rotate = keyframes(spin, [
    [0, '0deg'],
    [1, '360deg'],
  ]);
  const unspin = keyframes(spin, [
    [0, '0deg'],
    [1, '-360deg'],
  ]);
  const ringRotate = keyframes(ringSpin, [
    [0, '0deg'],
    [1, '-360deg'],
  ]);
  // breathe: .9 to 1.12 and back, with the glow fading .7 to 1; c7: 1 to 1.04 and back.
  const haloScale = keyframes(breathe, [
    [0, 0.9],
    [0.5, 1.12],
    [1, 0.9],
  ]);
  const haloOpacity = keyframes(breathe, [
    [0, 0.7],
    [0.5, 1],
    [1, 0.7],
  ]);
  const sevenScale = keyframes(breathe, [
    [0, 1],
    [0.5, 1.04],
    [1, 1],
  ]);
  const enter = keyframes(entry, [
    [0, 0.85],
    [1, 1],
  ]);
  const enterOpacity = keyframes(entry, [
    [0, 0],
    [1, 1],
  ]);
  const scale = size / ORBIT;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View
        style={[
          { width: ORBIT, height: ORBIT, transformOrigin: 'top left' },
          { opacity: enterOpacity, transform: [{ scale: Animated.multiply(enter, scale) }] },
        ]}
      >
        <Animated.View style={[styles.ring, { transform: [{ rotate: ringRotate }] }]}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle
              cx="100"
              cy="100"
              r="99.25"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}>
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={LIME} stopOpacity={0.28} />
                <Stop offset="0.7" stopColor={LIME} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx="80" cy="80" r="80" fill="url(#halo)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          {TILE_POS.map((_, i) => (
            <OrbitTile key={i} index={i} unspin={unspin} active={active} />
          ))}
        </Animated.View>
        <Animated.View style={[styles.seven, { transform: [{ scale: sevenScale }] }]}>
          <SvgSeven />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function SvgSeven() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="60" fill={LIME} />
      <SvgText
        x="60"
        y="87"
        textAnchor="middle"
        fontFamily={numeralFont}
        fontSize="76"
        fill="#06281B"
        letterSpacing="-3"
      >
        7
      </SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', left: 20, top: 20, width: 200, height: 200 },
  halo: { position: 'absolute', left: 40, top: 40, width: 160, height: 160 },
  seven: { position: 'absolute', left: 60, top: 60, width: 120, height: 120 },
  tileSlot: { position: 'absolute', width: 40, height: 40 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
