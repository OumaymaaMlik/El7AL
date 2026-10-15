import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Txt } from './Txt';

const GAP = 40;
/** Milliseconds per pixel: slow enough to read. */
const SPEED = 28;
/** A line too wide for its space is wider than any phone, so this never clips a copy of the text. */
const TRACK_WIDTH = 4000;

type TxtProps = React.ComponentProps<typeof Txt>;

/**
 * A single line of text. When it fits it stays still; when it does not, it scrolls sideways in a loop so the
 * whole line can be read. People who asked their phone to reduce motion get the usual "…" instead.
 */
export function MarqueeText({ children, ...textProps }: Omit<TxtProps, 'numberOfLines'> & { children: string }) {
  const [boxWidth, setBoxWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const overflows = boxWidth > 0 && textWidth > boxWidth;

  useEffect(() => {
    offset.setValue(0);
    if (!overflows || reduceMotion) return;
    const distance = textWidth + GAP;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(offset, {
          toValue: -distance,
          duration: distance * SPEED,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [overflows, reduceMotion, textWidth, offset, children]);

  if (reduceMotion) {
    return (
      <Txt {...textProps} numberOfLines={1}>
        {children}
      </Txt>
    );
  }

  return (
    <View style={styles.box} onLayout={(e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.track, { transform: [{ translateX: offset }] }]}>
        <Txt
          {...textProps}
          numberOfLines={1}
          style={[textProps.style, styles.noShrink]}
          onLayout={(e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width)}
        >
          {children}
        </Txt>
        {overflows && (
          <Txt {...textProps} numberOfLines={1} style={[textProps.style, styles.noShrink, styles.copy]}>
            {children}
          </Txt>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, overflow: 'hidden' },
  track: { width: TRACK_WIDTH, flexDirection: 'row', alignItems: 'center' },
  noShrink: { flexShrink: 0 },
  copy: { marginStart: GAP },
});
