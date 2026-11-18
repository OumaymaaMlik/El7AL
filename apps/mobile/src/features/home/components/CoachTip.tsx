import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter } from '../../../shared/theme/tokens';
import { getStorageItem, setStorageItem } from '../../../services/storage/secureStorage';

const KEY = 'el7al.coachTip.home';

/**
 * A one-time hint on the first visit: "Touchez un service, puis glissez pour lancer." It rises above the slide
 * bar, goes away on "Compris" or after 7 seconds, and never returns once seen.
 */
export function CoachTip({ bottom }: { bottom: number }) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void getStorageItem(KEY).then((seen) => {
      if (seen || !alive) return;
      timer = setTimeout(() => alive && setShow(true), 900);
    });
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!show) return;
    void setStorageItem(KEY, '1');
    Animated.timing(rise, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
    const id = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(id);
  }, [show, rise]);

  if (!show) return null;

  return (
    <Animated.View
      accessibilityRole="alert"
      style={[
        styles.bubble,
        {
          bottom,
          backgroundColor: colors.pill,
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}
    >
      <Txt variant="smallStrong" color={colors.onPill} style={styles.text}>
        {t('coachTip')}
      </Txt>
      <Pressable accessibilityRole="button" onPress={() => setShow(false)} style={styles.button}>
        <Txt variant="captionStrong" color={colors.onPill}>
          {t('gotIt')}
        </Txt>
      </Pressable>
      <View style={[styles.caret, { backgroundColor: colors.pill }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    start: gutter,
    end: gutter,
    zIndex: 90,
    borderRadius: 22,
    paddingStart: 18,
    paddingEnd: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0E2A1F',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  text: { flex: 1 },
  button: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.22)',
  },
  caret: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },
});
