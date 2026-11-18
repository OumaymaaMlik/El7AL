import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import { useReducedMotion } from '../../../shared/ui/useReducedMotion';
import { ROUTES } from '../../../navigation/routes';

/**
 * "Dossier envoyé": shown right after an artisan signs up. A floating shield with a check that pops, a promise
 * ("on vous prévient dès que votre compte est validé") and one way in: "Découvrir l'app".
 */
export function DocsSentScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const router = useRouter();
  const topPad = useTopPad();
  const reduce = useReducedMotion();
  const float = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) return;
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, delay: 250, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, pop, reduce]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.hero, paddingTop: topPad }]}>
      <View style={styles.center}>
        <View style={styles.art}>
          <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
            <Circle cx={110} cy={110} r={100} fill="#fff" fillOpacity={0.05} />
            <Circle cx={110} cy={110} r={72} fill="#fff" fillOpacity={0.07} />
          </Svg>
          <Animated.View
            style={[
              styles.layer,
              { transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] },
            ]}
          >
            <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
              <G>
                <Path
                  d="M110 50l46 18v36c0 30-20 50-46 60-26-10-46-30-46-60V68z"
                  fill="#DDE5DF"
                  stroke="#06140D"
                  strokeWidth={2.6}
                  strokeLinejoin="round"
                />
                <Path d="M110 64l32 12v26c0 21-14 36-32 43z" fill="#0F6B44" />
              </G>
            </Svg>
          </Animated.View>
          <Animated.View style={[styles.layer, { transform: [{ scale: pop }] }]}>
            <Svg width={220} height={220} viewBox="0 0 220 220" fill="none">
              <Circle cx={150} cy={150} r={24} fill="#A3E635" stroke="#06140D" strokeWidth={2.4} />
              <Path
                d="M139 150l8 8 15-16"
                stroke="#06140D"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </View>

        <View style={styles.text}>
          <Txt variant="title" color={colors.onBrand} style={styles.title} accessibilityRole="header">
            {t('docsSentTitle')}
          </Txt>
          <Txt variant="body" color={colors.onBrandMuted} style={styles.body}>
            {t('docsSentText')}
          </Txt>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(ROUTES.home)}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.live },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Txt variant="button" color={colors.onLive}>
            {t('discoverApp')}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 28 },
  art: { width: 220, height: 220 },
  layer: { ...StyleSheet.absoluteFillObject },
  text: { alignItems: 'center', gap: 10 },
  title: { fontFamily: numeralFont, textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 300 },
  actions: { paddingHorizontal: gutter + 4, paddingBottom: 34 },
  button: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
