import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useThemeStore } from '../store/useThemeStore';
import { artwork } from '../theme/artwork';
import { SpinningSeven } from './SpinningSeven';
import { useReducedMotion } from './useReducedMotion';

/** Height the proportions below were drawn for. Other heights scale everything. */
const BASE_HEIGHT = 220;
const RIPPLE_MS = 3600;
const STILL_PROGRESS = 0.45;

interface RippleProps {
  width: number;
  height: number;
  stroke: number;
  delay: number;
  still: boolean;
}

/** One ring spreading out from under the 7 and fading away. */
function Ripple({ width, height, stroke, delay, still }: RippleProps) {
  const progress = useRef(new Animated.Value(STILL_PROGRESS)).current;

  useEffect(() => {
    if (still) {
      progress.setValue(STILL_PROGRESS);
      return;
    }
    progress.setValue(0);
    const run = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: RIPPLE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ]);
    run.start();
    return () => run.stop();
  }, [still, delay, progress]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width,
        height,
        left: '50%',
        top: '82%',
        marginLeft: -width / 2,
        marginTop: -height / 2,
        opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 0] }),
        transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.25] }) }],
      }}
    >
      <Svg width={width} height={height}>
        <Ellipse
          cx={width / 2}
          cy={height / 2}
          rx={width / 2 - stroke}
          ry={height / 2 - stroke}
          stroke={artwork.ripple}
          strokeWidth={stroke}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

interface HeroArtProps {
  /** Height in points. The width is whatever the parent gives. */
  height?: number;
}

/** The El 7al illustration: a 7 turning above green waves. Decorative, so it is hidden from screen readers. */
export function HeroArt({ height = BASE_HEIGHT }: HeroArtProps) {
  const colors = useThemeStore((state) => state.colors);
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const k = height / BASE_HEIGHT;
  const shadow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      shadow.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shadow, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shadow, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, shadow]);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const sevenWidth = 76 * k;
  const rippleW = 300 * k;
  const rippleH = 64 * k;
  const shadowW = 90 * k;
  const shadowH = 20 * k;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={onLayout}
      style={[styles.frame, { height, backgroundColor: colors.brandInset, borderRadius: 18 * k }]}
    >
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Ellipse cx={width / 2} cy={height * 1.21} rx={width * 0.68} ry={height * 0.55} fill={artwork.hill} />
            <Ellipse
              cx={width / 2}
              cy={height * 0.94}
              rx={width * 0.54}
              ry={height * 0.22}
              stroke={artwork.ring}
              strokeWidth={5 * k}
              fill="none"
            />
          </Svg>
          {[0, 1200, 2400].map((delay) => (
            <Ripple key={delay} width={rippleW} height={rippleH} stroke={4 * k} delay={delay} still={reduceMotion} />
          ))}
          <Animated.View
            style={{
              position: 'absolute',
              left: '50%',
              top: '82%',
              width: shadowW,
              height: shadowH,
              marginLeft: -shadowW / 2,
              marginTop: -shadowH / 2,
              opacity: shadow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.35] }),
              transform: [{ scale: shadow.interpolate({ inputRange: [0, 1], outputRange: [1, 0.78] }) }],
            }}
          >
            <Svg width={shadowW} height={shadowH}>
              <Ellipse cx={shadowW / 2} cy={shadowH / 2} rx={shadowW / 2} ry={shadowH / 2} fill={artwork.shadow} />
            </Svg>
          </Animated.View>
          <View style={[styles.seven, { top: 22 * k, left: width / 2 - sevenWidth / 2 }]}>
            <SpinningSeven width={sevenWidth} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
  },
  seven: {
    position: 'absolute',
  },
});
