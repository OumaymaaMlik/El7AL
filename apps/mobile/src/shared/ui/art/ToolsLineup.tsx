import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ToolIcon } from './ToolIcon';
import type { ToolKey } from './toolArt';
import { useReducedMotion } from '../useReducedMotion';

/**
 * The sign-up header art, as in the El 7al prototype: four tools stand in a row, and one at a time steps up to
 * the middle in a pool of light, does its move, and goes back. It waits while the form is being filled in.
 */
const TOOLS: ToolKey[] = ['plomb', 'elec', 'meca', 'serr'];
/** Where each tool stands, as a share of the width (the prototype placed them at 70, 150, 240 and 320 of 390). */
const SHARE = [70 / 390, 150 / 390, 240 / 390, 320 / 390];
const TOOL_W = 44;
const TOOL_H = 70;
export const LINEUP_HEIGHT = 216;

/** Each tool's own move while it is in the light: [progress, value] keyframes, spread evenly. */
const MOVES: { translateY?: number[]; rotate: number[] }[] = [
  { rotate: [0, -22, 18, -10, 0] },
  { translateY: [0, -6, 0], rotate: [0, 180, 360] },
  { rotate: [0, -40, -40, 0] },
  { rotate: [0, 90, 90, 0] },
];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface Props {
  width: number;
  /** True while the form has focus: the show holds still and dims. */
  paused: boolean;
}

export function ToolsLineup({ width, paused }: Props) {
  const reduced = useReducedMotion();
  const travel = useRef(TOOLS.map(() => new Animated.Value(0))).current;
  const wiggle = useRef(TOOLS.map(() => new Animated.Value(0))).current;
  const circle = useRef(new Animated.Value(0)).current;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const dim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(dim, { toValue: paused ? 0.55 : 1, duration: 350, useNativeDriver: true }).start();
  }, [paused, dim]);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    const run = async () => {
      let i = 0;
      await wait(300);
      while (alive) {
        while (alive && pausedRef.current) await wait(400);
        if (!alive) return;
        // Up to the middle (1 s), do the move (1 s), back to place (1 s), then 0.5 s of rest.
        Animated.parallel([
          Animated.timing(travel[i], {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.3, 0.8, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(circle, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.3, 0.8, 0.3, 1.2),
            useNativeDriver: true,
          }),
        ]).start();
        await wait(1000);
        wiggle[i].setValue(0);
        Animated.timing(wiggle[i], {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start();
        await wait(1000);
        Animated.parallel([
          Animated.timing(travel[i], {
            toValue: 0,
            duration: 1000,
            easing: Easing.bezier(0.5, 0, 0.3, 1),
            useNativeDriver: true,
          }),
          Animated.timing(circle, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]).start();
        await wait(1500);
        i = (i + 1) % TOOLS.length;
      }
    };
    run();
    return () => {
      alive = false;
      travel.forEach((v) => v.stopAnimation());
      circle.stopAnimation();
    };
  }, [reduced, travel, wiggle, circle]);

  const frames = (values: number[]) => values.map((_, k) => k / (values.length - 1));
  const moves = useMemo(
    () =>
      MOVES.map((m, idx) => ({
        rotate: wiggle[idx].interpolate({ inputRange: frames(m.rotate), outputRange: m.rotate.map((d) => `${d}deg`) }),
        translateY: m.translateY
          ? wiggle[idx].interpolate({ inputRange: frames(m.translateY), outputRange: m.translateY })
          : undefined,
      })),
    [wiggle],
  );

  return (
    <Animated.View style={[styles.stage, { opacity: dim }]} pointerEvents="none">
      <Animated.View style={[styles.circle, { opacity: circle, transform: [{ scale: circle }] }]}>
        <View style={styles.circleInner} />
      </Animated.View>
      <View style={styles.floor} />
      {TOOLS.map((tool, i) => {
        const x = width * SHARE[i];
        const dx = width / 2 - x;
        const t = travel[i];
        return (
          <Animated.View
            key={tool}
            style={[
              styles.tool,
              {
                left: x - TOOL_W / 2,
                opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.45, 1, 1] }),
                transform: [
                  { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                  { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -54] }) },
                  { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) },
                ],
              },
            ]}
          >
            <Animated.View
              style={{
                transformOrigin: '50% 40%',
                transform: [
                  ...(moves[i].translateY ? [{ translateY: moves[i].translateY! }] : []),
                  { rotate: moves[i].rotate },
                ],
              }}
            >
              <ToolIcon tool={tool} palette="dark" width={TOOL_W} height={TOOL_H} />
            </Animated.View>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: { height: LINEUP_HEIGHT },
  circle: {
    position: 'absolute',
    left: '50%',
    top: 92,
    width: 148,
    height: 148,
    marginLeft: -74,
    marginTop: -74,
    borderRadius: 74,
    backgroundColor: 'rgba(181,242,61,0.12)',
  },
  circleInner: {
    position: 'absolute',
    left: 20,
    top: 20,
    right: 20,
    bottom: 20,
    borderRadius: 54,
    backgroundColor: 'rgba(181,242,61,0.2)',
  },
  floor: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 12,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  tool: { position: 'absolute', bottom: 14, width: TOOL_W, height: TOOL_H, transformOrigin: '50% 100%' },
});
