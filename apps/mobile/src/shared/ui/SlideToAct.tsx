import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useIsRTL } from '../store/useLanguageStore';
import { useReducedMotion } from './useReducedMotion';
import { Txt } from './Txt';

const HEIGHT = 60;
const PAD = 5;
const KNOB = HEIGHT - PAD * 2;
/** How far the knob must travel (share of the track) to count as a deliberate action. */
const THRESHOLD = 0.7;

interface SlideToActProps {
  /** What happens when the bar is slid to the end, e.g. "Glissez pour lancer". */
  label: string;
  onComplete: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** `dark` (default) is a night track; `light` is a white track for dark screens. */
  tone?: 'dark' | 'light';
}

/**
 * The slide-to-act bar. Important actions (launch a request, accept a mission,
 * move to the next step, send the amount) are confirmed by sliding the knob to
 * the end, so they cannot be triggered by a stray tap. A tap only nudges the knob.
 * Screen readers get a plain "activate" action instead of a drag.
 */
export function SlideToAct({ label, onComplete, loading = false, disabled = false, tone = 'dark' }: SlideToActProps) {
  const colors = useThemeStore((s) => s.colors);
  const isRTL = useIsRTL();
  const reduced = useReducedMotion();

  const dir = isRTL ? -1 : 1;
  const [width, setWidth] = useState(0);
  const travel = Math.max(0, width - KNOB - PAD * 2);
  const x = useRef(new Animated.Value(0)).current;
  const done = useRef(false);
  const travelRef = useRef(0);
  const inactiveRef = useRef(false);
  travelRef.current = travel;
  inactiveRef.current = disabled || loading;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const reset = useCallback(() => {
    done.current = false;
    Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 7, tension: 80 }).start();
  }, [x]);

  // Come back to the start when the action ends (loading finished or failed).
  useEffect(() => {
    if (!loading) reset();
  }, [loading, reset]);

  const nudge = useCallback(() => {
    if (reduced || inactiveRef.current) return;
    Animated.sequence([
      Animated.timing(x, { toValue: 22, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 6 }),
    ]).start();
  }, [reduced, x]);

  // A gentle hint that repeats until the user touches the bar.
  const touched = useRef(false);
  useEffect(() => {
    if (reduced || disabled) return;
    const id = setInterval(() => {
      if (!touched.current && !done.current) nudge();
    }, 3600);
    return () => clearInterval(id);
  }, [reduced, disabled, nudge]);

  const complete = useCallback(() => {
    if (done.current || inactiveRef.current) return;
    done.current = true;
    Animated.timing(x, { toValue: travelRef.current, duration: 120, useNativeDriver: true }).start(() => onComplete());
  }, [onComplete, x]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !inactiveRef.current,
        onMoveShouldSetPanResponder: () => !inactiveRef.current,
        onPanResponderGrant: () => {
          touched.current = true;
          x.stopAnimation();
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.max(0, Math.min(travelRef.current, g.dx * dir));
          x.setValue(next);
        },
        onPanResponderRelease: (_e, g) => {
          const moved = g.dx * dir;
          if (moved >= travelRef.current * THRESHOLD && travelRef.current > 0) complete();
          else if (Math.abs(g.dx) < 6) {
            nudge();
          } else reset();
        },
        onPanResponderTerminate: () => reset(),
      }),
    [complete, dir, nudge, reset, x],
  );

  // The prototype's track: the brand green with a lime knob, in both themes (lime is allowed on a brand surface).
  const onBrandTrack = tone !== 'light';
  const track = onBrandTrack ? colors.hero : '#FFFFFF';
  const textColor = onBrandTrack ? colors.onBrandMuted : '#0B1F16';
  const knobColor = onBrandTrack ? colors.live : colors.action;
  const knobInk = onBrandTrack ? colors.onLive : colors.onAction;
  const labelOpacity = x.interpolate({
    inputRange: [0, Math.max(1, travel * 0.6)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      accessibilityActions={[{ name: 'activate', label }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate') complete();
      }}
      style={[styles.track, { backgroundColor: track, opacity: disabled ? 0.5 : 1 }]}
      {...pan.panHandlers}
    >
      <Animated.View style={[styles.labelWrap, { opacity: labelOpacity }]} pointerEvents="none">
        <Txt variant="bodyStrong" color={textColor} numberOfLines={1}>
          {label}
        </Txt>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.knob,
          { backgroundColor: knobColor, start: PAD, transform: [{ translateX: Animated.multiply(x, dir) }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={knobInk} />
        ) : (
          <View style={isRTL ? styles.flip : undefined}>
            <ArrowRight size={22} color={knobInk} strokeWidth={2.6} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingStart: KNOB + PAD,
    paddingEnd: 16,
  },
  knob: {
    position: 'absolute',
    top: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flip: { transform: [{ scaleX: -1 }] },
});
