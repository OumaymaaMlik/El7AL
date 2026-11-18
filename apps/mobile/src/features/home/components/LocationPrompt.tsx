import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { MapPin } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';

interface Props {
  busy?: boolean;
  onAllow: () => void;
  onTypeAddress: () => void;
}

/**
 * "Où êtes-vous ?": shown before the device asks for the location, so the client knows why. A small map with a
 * pin that bobs and a ring that pulses, one line on how the position is used, and two ways forward.
 */
export function LocationPrompt({ busy = false, onAllow, onTypeAddress }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const bob = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const ringLoop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    bobLoop.start();
    ringLoop.start();
    return () => {
      bobLoop.stop();
      ringLoop.stop();
    };
  }, [bob, ring]);

  const pinY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.9] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.center}>
        <View style={styles.art}>
          <Svg width={260} height={240} viewBox="0 0 260 240">
            <Defs>
              <ClipPath id="lc">
                <Circle cx={130} cy={120} r={104} />
              </ClipPath>
            </Defs>
            <Circle cx={130} cy={120} r={104} fill={colors.tint} />
            <G clipPath="url(#lc)">
              <Path
                d="M0 80L260 56M0 168L260 146M84 0L100 240M176 0L162 240"
                stroke={colors.surface}
                strokeWidth={12}
              />
              <Rect x={186} y={160} width={50} height={40} rx={8} fill={colors.border} />
              <Rect x={28} y={96} width={42} height={40} rx={8} fill={colors.border} />
            </G>
            <Ellipse cx={130} cy={160} rx={18} ry={4} fill="#0B1F16" opacity={0.18} />
          </Svg>

          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
          />

          <Animated.View pointerEvents="none" style={[styles.pin, { transform: [{ translateY: pinY }] }]}>
            <Svg width={68} height={88} viewBox="96 66 68 88">
              <Path
                d="M130 66c-20 0-34 15-34 33 0 24 34 55 34 55s34-31 34-55c0-18-14-33-34-33z"
                fill="#0D5C3A"
                stroke="#06140D"
                strokeWidth={2.4}
                strokeLinejoin="round"
              />
              <Circle cx={130} cy={98} r={12} fill="#A3E635" stroke="#06140D" strokeWidth={2.2} />
            </Svg>
          </Animated.View>
        </View>

        <View style={styles.text}>
          <Txt variant="title" style={styles.title} accessibilityRole="header">
            {t('whereAreYou')}
          </Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.body}>
            {t('locationWhy')}
          </Txt>
        </View>
      </View>

      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 18 }]}>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onAllow}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.brand, opacity: busy ? 0.7 : 1 },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <MapPin size={18} color={colors.live} strokeWidth={2.4} />
          <Txt variant="button" color="#fff">
            {t('allowLocation')}
          </Txt>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onTypeAddress}
          style={({ pressed }) => [styles.secondary, { borderColor: colors.border }, pressed && { opacity: 0.7 }]}
        >
          <Txt variant="button" color={colors.accentText}>
            {t('typeAddress')}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, paddingHorizontal: 28 },
  art: { width: 260, height: 240, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(181,242,61,0.35)',
    top: 80,
  },
  pin: { position: 'absolute', top: 66 },
  text: { alignItems: 'center', gap: 10 },
  title: { fontFamily: numeralFont, fontSize: 32, lineHeight: 35, textAlign: 'center' },
  body: { textAlign: 'center', maxWidth: 300 },
  actions: { paddingHorizontal: gutter + 4, gap: 10 },
  primary: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondary: { height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
