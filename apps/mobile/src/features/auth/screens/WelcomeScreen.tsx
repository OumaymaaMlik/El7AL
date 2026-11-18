import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Globe } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark } from '../../../shared/ui/BrandMark';
import { Button } from '../../../shared/ui/Button';
import { LanguagePickerSheet, languageLabel } from '../../../shared/ui/LanguageToggle';
import { IdCardSlide, MapSlide, OrbitSlide, PipeSlide } from '../../../shared/ui/art/WelcomeSlides';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useLanguageStore, useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter, space } from '../../../shared/theme/tokens';
import type { TranslationKeys } from '../../../shared/i18n/translations';
import { useTopPad } from '../../../shared/theme/useTopPad';

interface Slide {
  Art: React.ComponentType<{ active: boolean }>;
  title?: TranslationKeys;
  text?: TranslationKeys;
}

/** Slide 1 is the 7 and the six trades, with no words. The other three say one thing each, over their drawing. */
const SLIDES: Slide[] = [
  { Art: ({ active }) => <OrbitSlide size={260} active={active} /> },
  { Art: ({ active }) => <PipeSlide active={active} />, title: 'onbOutageTitle', text: 'onbOutageText' },
  { Art: ({ active }) => <IdCardSlide active={active} />, title: 'onbVerifiedTitle', text: 'onbVerifiedText' },
  { Art: ({ active }) => <MapSlide active={active} />, title: 'onbLiveTitle', text: 'onbLiveText' },
];

const AUTO_ADVANCE_MS = 5200;

/**
 * The first screen: four swipeable slides on the brand green, and the two ways in. The slides advance by
 * themselves once, and stop at the first touch or on the last slide.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const colors = useThemeStore((state) => state.colors);
  const language = useLanguageStore((state) => state.language);
  const { t } = useTranslation();

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [languageOpen, setLanguageOpen] = useState(false);
  const stopped = useRef(false);

  // The track is as wide as all the slides. `pos` is its horizontal offset: it follows the finger or the
  // mouse while dragging, and eases to the nearest slide on release.
  const pos = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const widthRef = useRef(0);
  widthRef.current = width;

  const goTo = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(SLIDES.length - 1, i));
      indexRef.current = next;
      setIndex(next);
      Animated.timing(pos, {
        toValue: -next * widthRef.current,
        duration: 450,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: true,
      }).start();
    },
    [pos],
  );

  // Keep the track on the current slide when the width changes (rotation, window resize).
  useEffect(() => {
    pos.setValue(-indexRef.current * width);
  }, [width, pos]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        stopped.current = true;
        pos.stopAnimation();
      },
      onPanResponderMove: (_e, g) => {
        const last = (SLIDES.length - 1) * widthRef.current;
        const base = -indexRef.current * widthRef.current;
        // A little resistance past the first and last slide.
        const raw = base + g.dx;
        pos.setValue(raw > 0 ? raw / 3 : raw < -last ? -last + (raw + last) / 3 : raw);
      },
      onPanResponderRelease: (_e, g) => {
        const far = Math.abs(g.dx) > widthRef.current * 0.18 || Math.abs(g.vx) > 0.5;
        goTo(indexRef.current + (far ? (g.dx < 0 ? 1 : -1) : 0));
      },
      onPanResponderTerminate: () => goTo(indexRef.current),
    }),
  ).current;

  useEffect(() => {
    if (!width) return;
    const id = setInterval(() => {
      if (stopped.current) return;
      if (indexRef.current >= SLIDES.length - 1) {
        stopped.current = true;
        return;
      }
      goTo(indexRef.current + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [width, goTo]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.screen, { backgroundColor: colors.brand, paddingTop: topPad }]}>
      <StatusBar style="light" />

      <View style={styles.top}>
        <View style={styles.progress} accessibilityRole="tablist">
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              accessibilityRole="tab"
              accessibilityState={{ selected: i === index }}
              accessibilityLabel={`${i + 1} / ${SLIDES.length}`}
              hitSlop={{ top: 14, bottom: 14 }}
              onPress={() => {
                stopped.current = true;
                goTo(i);
              }}
              style={[styles.bar, { backgroundColor: i === index ? colors.live : 'rgba(255,255,255,0.22)' }]}
            />
          ))}
        </View>
        <View style={styles.brandRow}>
          <BrandMark onDark />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('languageLabel')}: ${languageLabel(language)}`}
            onPress={() => setLanguageOpen(true)}
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
          >
            <Globe size={15} color={colors.onBrand} />
            <Txt variant="smallStrong" color={colors.onBrand}>
              {languageLabel(language)}
            </Txt>
          </Pressable>
        </View>
      </View>

      <View style={styles.slides} onLayout={onLayout} {...pan.panHandlers}>
        {width > 0 && (
          <Animated.View style={[styles.track, { width: width * SLIDES.length, transform: [{ translateX: pos }] }]}>
            {SLIDES.map((slide, i) => (
              <View key={i} style={[styles.slide, { width }]}>
                <slide.Art active={i === index} />
                {slide.title && slide.text && (
                  <View style={styles.texts}>
                    <Txt variant="display" color={colors.onBrand} style={styles.title} accessibilityRole="header">
                      {t(slide.title)}
                    </Txt>
                    <Txt variant="body" color={colors.onBrandMuted} style={styles.text}>
                      {t(slide.text)}
                    </Txt>
                  </View>
                )}
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 18 }]}>
        <Button title={t('signUpShort')} onPress={() => router.push('/(auth)/register')} style={styles.flex} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('loginShort')}
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
        >
          <Txt variant="button" color={colors.onBrand}>
            {t('loginShort')}
          </Txt>
        </Pressable>
      </View>

      <LanguagePickerSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  top: { paddingHorizontal: gutter + 4, gap: 18 },
  progress: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  slides: {
    flex: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' } as object) : null),
  },
  track: { flex: 1, flexDirection: 'row' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 28 },
  texts: { alignItems: 'center', gap: space.md },
  title: { textAlign: 'center' },
  text: { textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: gutter },
  ghost: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
