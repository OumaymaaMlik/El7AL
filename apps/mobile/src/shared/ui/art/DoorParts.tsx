import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { keyframes, useLoop } from './useLoop';

export const FRAME_W = 112;
const FRAME_H = 184;
export const LIME = '#A3E635';
const DARK = '#06140D';
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

export function FlyingKey({ left, t }: { left: number; t: Animated.Value }) {
  const translateX = keyframes(
    t,
    [
      [0, 70],
      [0.32, 0],
      [1, 0],
    ],
    EASE,
  );
  const opacity = keyframes(t, [
    [0, 0],
    [0.12, 1],
    [0.48, 1],
    [0.58, 0],
    [1, 0],
  ]);
  const rotate = keyframes(
    t,
    [
      [0, '0deg'],
      [0.32, '0deg'],
      [0.48, '90deg'],
      [1, '90deg'],
    ],
    EASE,
  );
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.key,
        { left: left + 110 - 9, top: 200 - 10 - FRAME_H * 0.52 - 11, opacity, transform: [{ translateX }, { rotate }] },
      ]}
    >
      <Svg width={62} height={22} viewBox="0 0 62 22" fill="none">
        <Rect x="1" y="8" width="34" height="6" rx="1.5" fill={LIME} stroke={DARK} strokeWidth={1.6} />
        <Path d="M6 14v5h5v-5" fill={LIME} stroke={DARK} strokeWidth={1.6} strokeLinejoin="round" />
        <Circle cx="47" cy="11" r="10" fill={LIME} stroke={DARK} strokeWidth={1.6} />
        <Circle cx="47" cy="11" r="3.4" fill="#0D5E3E" />
      </Svg>
    </Animated.View>
  );
}

/* The envelope that flies at the mail slot, with its speed lines (Forgot password, step 1). */
export function Envelope({ left }: { left: number }) {
  const t = useLoop(3200, { easing: Easing.bezier(0.3, 0.7, 0.3, 1) });
  const raw = useLoop(3200);
  const translateX = keyframes(t, [
    [0, -150],
    [0.55, 0],
    [0.7, 0],
    [0.85, 52],
    [1, 52],
  ]);
  const translateY = keyframes(t, [
    [0, 30],
    [0.55, 0],
    [0.7, 0],
    [0.85, 22],
    [1, 22],
  ]);
  const rotate = keyframes(t, [
    [0, '-18deg'],
    [0.55, '-6deg'],
    [0.7, '-6deg'],
    [0.85, '0deg'],
    [1, '0deg'],
  ]);
  const scale = keyframes(t, [
    [0, 1],
    [0.7, 1],
    [0.85, 0.35],
    [1, 0.35],
  ]);
  const opacity = keyframes(raw, [
    [0, 0],
    [0.15, 1],
    [0.7, 1],
    [0.85, 0],
    [1, 0],
  ]);
  const speedOpacity = keyframes(raw, [
    [0, 0],
    [0.1, 0],
    [0.3, 0.6],
    [0.55, 0],
    [1, 0],
  ]);
  const speedX = keyframes(raw, [
    [0, -20],
    [0.1, -20],
    [0.3, 0],
    [1, 0],
  ]);
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: left - 150,
          top: 84,
          opacity: speedOpacity,
          transform: [{ translateX: speedX }],
        }}
      >
        <Svg width={60} height={40} viewBox="0 0 60 40" fill="none">
          <Path d="M4 20h40M14 6h30M20 34h24" stroke={LIME} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
        </Svg>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: left - 74,
          top: 66,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        }}
      >
        <Svg width={96} height={66} viewBox="0 0 96 66" fill="none">
          <Rect x="2" y="2" width="92" height="62" rx="8" fill="#DDE5DF" stroke={DARK} strokeWidth={2.4} />
          <Path d="M4 6l44 32 44-32" stroke={DARK} strokeWidth={2.4} strokeLinejoin="round" />
          <Circle cx="84" cy="8" r="11" fill={LIME} stroke={DARK} strokeWidth={2} />
          <Path d="M80 8.5l3 3 5.5-6" stroke={DARK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </>
  );
}

/* The key being cut as the code is typed: the head is there from the start, each tooth fills in (step 2). */
export function BuildKey({ left, teeth, go }: { left: number; teeth: number; go: boolean }) {
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(slide, {
      toValue: go ? 54 : 0,
      duration: 700,
      easing: Easing.bezier(0.5, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [go, slide]);
  const part = (i: number) =>
    teeth >= i
      ? { fill: LIME, stroke: DARK, strokeWidth: 2.2, strokeDasharray: undefined }
      : { fill: 'none', stroke: LIME, strokeWidth: 2, strokeDasharray: '4 3' };
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: left - 150, top: 76, transform: [{ translateX: slide }] }}
    >
      <Svg width={150} height={60} viewBox="0 0 150 60" fill="none" style={{ overflow: 'visible' }}>
        <Circle cx="34" cy="30" r="34" fill={LIME} fillOpacity={0.12} />
        <G>
          <Circle cx="34" cy="30" r="18" fill={LIME} stroke={DARK} strokeWidth={2.2} />
          <Circle cx="34" cy="30" r="7" fill="#0D5C3A" stroke={DARK} strokeWidth={2} />
        </G>
        <Rect x="52" y="24" width="30" height="12" rx="2" {...part(1)} />
        <Rect x="84" y="24" width="24" height="12" rx="2" {...part(2)} />
        <Path d="M110 24h20v12h-20zM114 36v12h9v-12" {...part(3)} />
      </Svg>
    </Animated.View>
  );
}

export const styles = StyleSheet.create({
  scene: { height: 200, marginTop: 14 },
  floor: {
    position: 'absolute',
    left: 50,
    right: 50,
    bottom: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  frame: {
    position: 'absolute',
    bottom: 10,
    width: FRAME_W,
    height: FRAME_H,
    borderRadius: 5,
    backgroundColor: '#0A4A2E',
  },
  inside: { position: 'absolute', left: 6, right: 6, top: 6, bottom: 0, overflow: 'hidden' },
  tool: { position: 'absolute', left: 44, bottom: 6, width: 38, height: 62 },
  leaf: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 6,
    bottom: 0,
    backgroundColor: '#0D5E3E',
    borderWidth: 2,
    borderColor: DARK,
    transformOrigin: 'left center',
  },
  panel: { position: 'absolute', left: '10%', right: '10%', borderWidth: 1.5, borderColor: 'rgba(6,20,13,0.35)' },
  slot: {
    position: 'absolute',
    left: '24%',
    right: '24%',
    top: '62%',
    height: 8,
    borderRadius: 3,
    backgroundColor: 'rgba(6,20,13,0.55)',
  },
  keyhole: { position: 'absolute', right: 9, top: '48%', width: 8, height: 16 },
  khBall: { position: 'absolute', left: 0, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: DARK },
  khBar: { position: 'absolute', left: 2.5, top: 6, width: 3, height: 8, borderRadius: 2, backgroundColor: DARK },
  spill: { position: 'absolute', bottom: 0, width: 140, height: 16 },
  key: { position: 'absolute', width: 62, height: 22 },
});
