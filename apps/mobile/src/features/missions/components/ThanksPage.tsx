import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Check, Star } from 'lucide-react-native';
import { Confetti } from '../../../shared/ui/Confetti';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { numeralFont } from '../../../shared/theme/typography';
import { gutter } from '../../../shared/theme/tokens';
import { useTopPad } from '../../../shared/theme/useTopPad';
import { useAuthStore } from '../../auth';
import type { ThanksData } from '../store/useMissionStore';

interface Props {
  data: ThanksData;
  onHome: () => void;
  onRequests: () => void;
}

/**
 * The ending people remember: after the job is paid and rated, a green "Merci" page with a lime check that pops,
 * confetti, a short summary and one way home (peak-end rule). It rises over the home page.
 */
export function ThanksPage({ data, onHome, onRequests }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const topPad = useTopPad();
  const firstName =
    useAuthStore((s) => s.user?.fullName)
      ?.trim()
      .split(/\s+/)[0] ?? '';
  const rise = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: 400,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, delay: 150, useNativeDriver: true }).start();
  }, [rise, pop]);

  const lines = [
    data.providerName ? t('thanksFixedBy').replace('{name}', data.providerName) : null,
    data.amount
      ? t('thanksPaid').replace('{amount}', String(Math.round(data.amount * 1000) / 1000).replace('.', ','))
      : null,
  ].filter(Boolean) as string[];

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: colors.hero,
          paddingTop: topPad,
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <View style={styles.center}>
        <Animated.View style={[styles.check, { backgroundColor: colors.live, transform: [{ scale: pop }] }]}>
          <Check size={44} color={colors.onLive} strokeWidth={3} />
        </Animated.View>
        <Txt variant="title" color={colors.onBrand} style={styles.title} accessibilityRole="header">
          {t('thanksHeadline').replace('{name}', firstName)}
        </Txt>
        {lines.map((line) => (
          <Txt key={line} variant="body" color={colors.onBrandMuted} style={styles.line}>
            {line}
          </Txt>
        ))}
        <View style={styles.stars} accessibilityLabel={t('ratingOutOfFive').replace('{n}', String(data.rating))}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={26}
              color={n <= data.rating ? colors.live : 'rgba(255,255,255,0.22)'}
              fill={n <= data.rating ? colors.live : 'transparent'}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onHome}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: colors.live },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Txt variant="button" color={colors.onLive}>
            {t('backHome')}
          </Txt>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRequests} style={styles.link}>
          <Txt variant="smallStrong" color={colors.onBrandMuted}>
            {t('myRequests')}
          </Txt>
        </Pressable>
      </View>

      <Confetti />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 300, elevation: 300 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 28 },
  check: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: numeralFont, fontSize: 36, lineHeight: 40, textAlign: 'center' },
  line: { textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 6, marginTop: 4 },
  actions: { paddingHorizontal: gutter, paddingBottom: 34, gap: 4, alignItems: 'stretch' },
  primary: { height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
