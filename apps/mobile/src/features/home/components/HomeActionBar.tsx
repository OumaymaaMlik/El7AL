import { useEffect, useRef, useState } from 'react';
import type { Category } from '../../categories';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight, Bell } from 'lucide-react-native';
import { SlideToAct } from '../../../shared/ui/SlideToAct';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { gutter, space } from '../../../shared/theme/tokens';

interface HomeActionBarProps {
  /** The currently selected category (if any). */
  category: Category | null;
  /** Whether the action bar is visible. */
  visible: boolean;
  /** Distance from screen bottom (typically tabBarHeight + bottomInset). */
  bottomOffset: number;
  /** Primary action callback (open the request page). */
  onConfirm: () => void;
  /** Callback when zero pros are available and the user wants to be notified. */
  onNotifyAvailable?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const HIDE_OFFSET = 110;

/**
 * The launch bar: just the slide-to-act track ("Glissez pour lancer · Plomberie") above the tab bar. It rises
 * when a service is chosen and drops away when it is cleared.
 */
export function HomeActionBar({
  category,
  visible,
  bottomOffset,
  onConfirm,
  onNotifyAvailable,
  loading = false,
  disabled = false,
}: HomeActionBarProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  const slide = useRef(new Animated.Value(HIDE_OFFSET)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, friction: 7, tension: 70, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: HIDE_OFFSET, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible, slide, fade]);

  if (!mounted && !visible) return null;

  const count: number | undefined =
    typeof category?.availableProvidersCount === 'number' ? category.availableProvidersCount : undefined;
  const isZeroAvailable = count === 0;
  const isDisabled = disabled || !category;

  const handlePress = () => {
    if (isDisabled || loading) return;
    if (isZeroAvailable && onNotifyAvailable) onNotifyAvailable();
    else onConfirm();
  };

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.container, { bottom: bottomOffset, opacity: fade, transform: [{ translateY: slide }] }]}
    >
      {!category ? (
        <View style={[styles.hint, { backgroundColor: colors.tint }]}>
          <ArrowRight size={18} color={colors.textMuted} strokeWidth={2.4} />
          <Txt variant="bodyStrong" color={colors.textMuted}>
            {t('chooseService')}
          </Txt>
        </View>
      ) : isZeroAvailable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('notifyWhenAvailable')}
          onPress={handlePress}
          style={[styles.notify, { backgroundColor: colors.tint }]}
        >
          <Bell size={18} color={colors.accentText} strokeWidth={2.2} />
          <Txt variant="bodyStrong" color={colors.accentText} numberOfLines={1}>
            {t('notifyWhenAvailable')}
          </Txt>
        </Pressable>
      ) : (
        <SlideToAct
          label={t('slideToLaunchService').replace('{service}', category?.name ?? '')}
          onComplete={handlePress}
          loading={loading}
          disabled={isDisabled}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: gutter - 4,
    paddingTop: 12,
    paddingBottom: 10,
    zIndex: 99,
  },
  hint: {
    height: 66,
    borderRadius: 33,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  notify: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
});
