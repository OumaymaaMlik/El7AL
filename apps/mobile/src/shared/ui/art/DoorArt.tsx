import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ToolIcon } from './ToolIcon';
import { keyframes, useLoop } from './useLoop';
import { BuildKey, EASE, Envelope, FRAME_W, FlyingKey, LIME, styles } from './DoorParts';

/**
 * The door scene at the top of Login and Forgot password, drawn and animated as in the El 7al prototype.
 *  - loop:    a key slides in, turns, and the door swings open onto the light (Login, plays once).
 *  - env:     an envelope flies towards the mail slot (Forgot password, step 1).
 *  - build:   the key is cut tooth by tooth as the code is typed, then slides in (step 2).
 *  - opening: the door opens and the tool inside wiggles (step 3).
 */
export type DoorMode = 'loop' | 'env' | 'build' | 'opening';

interface DoorArtProps {
  mode: DoorMode;
  /** Where the door stands: in the middle, or pushed to the right to make room for the envelope and key. */
  offset?: 'center' | 'right';
  /** build: how many of the three key teeth are cut (0 to 3). */
  teeth?: number;
  /** build: the code is complete, so the key slides towards the door. */
  go?: boolean;
  /** Changes whenever the door should shiver (a wrong password on Login). */
  shake?: number;
}

export function DoorArt({ mode, offset = 'center', teeth = 0, go = false, shake = 0 }: DoorArtProps) {
  const shiver = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!shake) return;
    Animated.sequence(
      [6, -6, 4, -4, 0].map((to) => Animated.timing(shiver, { toValue: to, duration: 80, useNativeDriver: true })),
    ).start();
  }, [shake, shiver]);
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  // The prototype placed the door at 139 of 390 (centred) or 190 of 390 (right).
  const left = width ? width / 2 - FRAME_W / 2 + (offset === 'right' ? 51 : 0) : 0;

  // Login: one 3 s timeline that starts after 0.25 s and rests open.
  const loop = useLoop(3000, { delay: 250, once: true, enabled: mode === 'loop' });
  // Forgot step 3: the door opens over 1.4 s after 0.3 s.
  const opening = useLoop(1400, {
    delay: 300,
    once: true,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    enabled: mode === 'opening',
  });
  // The tool in the doorway wiggles once on Login, and keeps wiggling once the door opens on step 3.
  const wiggleOnce = useLoop(1600, { delay: 2900, once: true, enabled: mode === 'loop' });
  const wiggleLoop = useLoop(3000, { delay: 1200, enabled: mode === 'opening' });
  const wiggle = mode === 'loop' ? wiggleOnce : wiggleLoop;
  // dtool: rest until 58 percent, then three quick hops and a tilt, back to rest by 82 percent.
  const wiggleFrames: [number, number][] = [
    [0, 0],
    [0.58, 0],
    [0.64, -8],
    [0.7, 0],
    [0.76, -4],
    [0.82, 0],
    [1, 0],
  ];
  const wiggleTilt: [number, string][] = [
    [0, '0deg'],
    [0.58, '0deg'],
    [0.64, '-8deg'],
    [0.7, '6deg'],
    [0.76, '-3deg'],
    [0.82, '0deg'],
    [1, '0deg'],
  ];

  const leafAngle =
    mode === 'loop'
      ? keyframes(
          loop,
          [
            [0, '0deg'],
            [0.52, '0deg'],
            [0.88, '74deg'],
            [1, '74deg'],
          ],
          EASE,
        )
      : mode === 'opening'
        ? keyframes(opening, [
            [0, '0deg'],
            [1, '74deg'],
          ])
        : '0deg';
  const spillOpacity =
    mode === 'loop'
      ? keyframes(loop, [
          [0, 0],
          [0.55, 0],
          [0.9, 1],
          [1, 1],
        ])
      : mode === 'opening'
        ? keyframes(opening, [
            [0, 0],
            [1, 1],
          ])
        : 0;

  return (
    <View style={styles.scene} onLayout={onLayout}>
      <View style={styles.floor} />
      {width > 0 && (
        <>
          <Animated.View style={[styles.spill, { left: left - 14, opacity: spillOpacity as never }]}>
            <Svg width={140} height={16} viewBox="0 0 140 16">
              <Defs>
                <LinearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={LIME} stopOpacity={0.5} />
                  <Stop offset="1" stopColor={LIME} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Polygon points="11.2,0 128.8,0 140,16 0,16" fill="url(#spill)" />
            </Svg>
          </Animated.View>

          <Animated.View style={[styles.frame, { left, transform: [{ translateX: shiver }] }]}>
            <View style={styles.inside}>
              <Svg width={100} height={178} viewBox="0 0 100 178" style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="glow" cx="50%" cy="58%" rx="50%" ry="50%">
                    <Stop offset="0" stopColor="#D9F99D" />
                    <Stop offset="0.55" stopColor={LIME} />
                    <Stop offset="1" stopColor="#6FA61E" />
                  </RadialGradient>
                </Defs>
                <Rect width={100} height={178} fill="url(#glow)" />
              </Svg>
              <Animated.View
                style={[
                  styles.tool,
                  {
                    transform: [
                      { translateY: keyframes(wiggle, wiggleFrames) as never },
                      { rotate: keyframes(wiggle, wiggleTilt) as never },
                    ],
                  },
                ]}
              >
                <ToolIcon tool="plomb" palette="light" width={38} height={62} />
              </Animated.View>
            </View>

            <Animated.View
              style={[styles.leaf, { transform: [{ perspective: 520 }, { rotateY: leafAngle as never }] }]}
            >
              <View style={[styles.panel, { top: '8%', height: '34%' }]} />
              <View style={[styles.panel, { top: '50%', height: '42%' }]} />
              {mode === 'env' && <View style={styles.slot} />}
              <View style={styles.keyhole}>
                <View style={styles.khBall} />
                <View style={styles.khBar} />
              </View>
            </Animated.View>
          </Animated.View>

          {mode === 'loop' && <FlyingKey left={left} t={loop} />}
          {mode === 'env' && <Envelope left={left} />}
          {mode === 'build' && <BuildKey left={left} teeth={teeth} go={go} />}
        </>
      )}
    </View>
  );
}

/* The key that slides in and turns before the door opens (Login). */
