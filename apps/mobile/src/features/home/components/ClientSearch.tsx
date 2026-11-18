import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useMissionStore } from '../../missions/store/useMissionStore';
import { useTopPad } from '../../../shared/theme/useTopPad';
import type { PairedProvider } from '../../missions/types';
import { FoundSheet, NoneSheet, SearchingSheet } from './SearchSheets';

interface Props {
  phase: 'searching' | 'found' | 'none';
  /** How many artisans of the chosen trade are online, when known. */
  online?: number;
  /** The artisan who accepted (phase `found`). */
  provider: PairedProvider | null;
  onCancel: () => void;
  onTrack: () => void;
  onRetry: () => void;
}

/** A blip that fades in and out on the radar, offset so they do not blink together. */
function Blip({
  x,
  y,
  r,
  letter,
  delay,
  strong,
}: {
  x: number;
  y: number;
  r: number;
  letter?: string;
  delay: number;
  strong?: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: strong ? 1 : 0.55, duration: 700, useNativeDriver: true }),
        Animated.delay(1400),
        Animated.timing(opacity, { toValue: strong ? 0.5 : 0.15, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, opacity, strong]);
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 360">
        <Circle cx={x} cy={y} r={r} fill="#fff" />
        {letter && (
          <SvgText x={x} y={y + r * 0.32} textAnchor="middle" fontSize={r * 0.85} fontWeight="800" fill="#0D5C3A">
            {letter}
          </SvgText>
        )}
        {strong && <Circle cx={x + 14} cy={y - 14} r={6} fill="#A3E635" stroke="#0D5C3A" strokeWidth={2} />}
      </Svg>
    </Animated.View>
  );
}

/**
 * The searching screen, as in the prototype: the green page with "EN DIRECT", the count of artisans online near
 * you, a radar that sweeps around the pin while the request is out, and a white sheet with a cancel link.
 */
export function ClientSearch({ phase, online, provider, onCancel, onTrack, onRetry }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();
  const statusText = useMissionStore((s) => s.searchStatusText);
  const eta = useMissionStore((s) => s.etaMinutes);
  const sweep = useRef(new Animated.Value(0)).current;
  const [count, setCount] = React.useState(0);
  const { width } = useWindowDimensions();
  const enter = useRef(new Animated.Value(width)).current;

  // Slides in from the edge over the home page, 350 ms.
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 0,
      duration: 350,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  // The radar sweeps only while the request is out; once an artisan is found it stops.
  useEffect(() => {
    if (phase === 'found') return;
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep, phase]);

  // The online count climbs up to the real number, like the prototype's.
  useEffect(() => {
    const target = online ?? 0;
    if (target <= 0) return;
    setCount(0);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= target) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [online]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // The sweep turns once per 3.2 s; the small spinner turns about three times faster.
  const spin = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] });

  return (
    <Animated.View
      style={[styles.screen, styles.overlay, { backgroundColor: colors.hero, transform: [{ translateX: enter }] }]}
    >
      <View style={[styles.top, { paddingTop: topPad + 12 }]}>
        <View style={styles.liveChip}>
          <LiveDot />
          <Txt variant="overline" color={colors.live}>
            {t('liveCaps')}
          </Txt>
        </View>
        <Txt variant="heading" color={colors.onBrand} style={styles.title} accessibilityRole="header">
          {phase === 'found' ? t('artisanFound') : phase === 'none' ? t('stillSearching') : t('artisansNotified')}
        </Txt>
        {phase === 'searching' && online ? (
          <Txt variant="body" color={colors.onBrandMuted}>
            {count} · {t('searchingNear')}
          </Txt>
        ) : null}
      </View>

      <View style={styles.radar}>
        <Svg width="100%" height="100%" viewBox="0 0 390 360" preserveAspectRatio="xMidYMid meet">
          <Circle cx={195} cy={180} r={160} stroke="#fff" strokeOpacity={0.08} strokeWidth={1.5} fill="none" />
          <Circle cx={195} cy={180} r={112} stroke="#fff" strokeOpacity={0.12} strokeWidth={1.5} fill="none" />
          <Circle cx={195} cy={180} r={64} stroke="#fff" strokeOpacity={0.18} strokeWidth={1.5} fill="none" />
          <Circle cx={195} cy={180} r={30} fill="#A3E635" />
          <Path
            d="M195 166c-6 0-10 4.4-10 9.6 0 6.8 10 16.4 10 16.4s10-9.6 10-16.4c0-5.2-4-9.6-10-9.6z"
            fill="#0D5C3A"
          />
          <Circle cx={195} cy={175.5} r={3.4} fill="#A3E635" />
        </Svg>

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 390 360" preserveAspectRatio="xMidYMid meet">
            <Defs>
              <RadialGradient id="sw" cx="195" cy="180" r="160" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#A3E635" stopOpacity={0.45} />
                <Stop offset="1" stopColor="#A3E635" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <G>
              <Path d="M195 180L195 20A160 160 0 0 1 333 100Z" fill="url(#sw)" />
              <Path d="M195 180L195 20" stroke="#A3E635" strokeOpacity={0.7} strokeWidth={2} />
            </G>
          </Svg>
        </Animated.View>

        <Blip x={96} y={120} r={15} letter="K" delay={500} />
        <Blip x={300} y={258} r={13} letter="M" delay={1000} />
        <Blip x={118} y={282} r={11} delay={1400} />
        <Blip x={60} y={210} r={8} delay={1800} />
        {phase !== 'none' && <Blip x={282} y={96} r={20} letter="A" delay={2300} strong />}
      </View>

      {phase === 'found' ? (
        <FoundSheet provider={provider} eta={eta} onTrack={onTrack} />
      ) : phase === 'none' ? (
        <NoneSheet onRetry={onRetry} onCancel={onCancel} />
      ) : (
        <SearchingSheet statusText={statusText} spin={spin} onCancel={onCancel} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1 },
  // Laid over the home page, so the page is still there while this one slides in.
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 200, elevation: 200 },
  top: { alignItems: 'center', gap: 8, paddingHorizontal: gutter },
  liveChip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(181,242,61,0.16)',
  },
  title: { fontSize: 30, lineHeight: 33, textAlign: 'center', fontFamily: numeralFont },
  radar: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
});
