import { useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useSlideLeave } from '../../../shared/ui/SlideScreen';
import { BrandMark } from '../../../shared/ui/BrandMark';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { DoorArt, type DoorMode } from '../../../shared/ui/art/DoorArt';
import { LINEUP_HEIGHT, ToolsLineup } from '../../../shared/ui/art/ToolsLineup';
import { gutter } from '../../../shared/theme/tokens';

const NAV_HEIGHT = 46;
/** How far the sign-up header shrinks while the form scrolls (the height of the tool line-up plus its margin). */
const COLLAPSE_RANGE = LINEUP_HEIGHT + 2;

/** The two heights of the collapsing sign-up header, for a given top inset. */
export function lineupHeaderHeights(insetTop: number) {
  const min = insetTop + 6 + NAV_HEIGHT + 12;
  return { min, max: min + COLLAPSE_RANGE, range: COLLAPSE_RANGE };
}

export type HeaderArt =
  | { kind: 'door'; mode: DoorMode; offset?: 'center' | 'right'; teeth?: number; go?: boolean; shake?: number }
  | { kind: 'lineup'; paused: boolean };

interface AuthHeaderProps {
  onBack: () => void;
  art: HeaderArt;
  /** Sign-up only: the form's scroll offset. The header shrinks and the tools fade out as it grows. */
  scrollY?: Animated.Value;
}

/**
 * The green header of Login, Register and Forgot password: a round back button, the logo, and the animated
 * scene (the door, or the four tools). The bottom corners are rounded. On sign-up it collapses as the form scrolls.
 */
export function AuthHeader({ onBack, art, scrollY }: AuthHeaderProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const leave = useSlideLeave();
  const { min, max, range } = lineupHeaderHeights(insets.top);

  const nav = (
    <View style={[styles.row, { paddingTop: insets.top + 6 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('back')}
        onPress={() => leave(onBack)}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}
      >
        <Mirrored>
          <ArrowLeft size={18} color={colors.onBrand} />
        </Mirrored>
      </Pressable>
      <BrandMark onDark />
      <View style={styles.back} />
    </View>
  );

  // Collapsing header (sign-up): its height, corners and tools follow the scroll.
  if (art.kind === 'lineup' && scrollY) {
    const p = scrollY.interpolate({ inputRange: [0, range], outputRange: [0, 1], extrapolate: 'clamp' });
    return (
      <Animated.View
        onLayout={onLayout}
        style={[
          styles.header,
          styles.collapsing,
          {
            backgroundColor: colors.brand,
            height: p.interpolate({ inputRange: [0, 1], outputRange: [max, min] }),
            borderBottomLeftRadius: p.interpolate({ inputRange: [0, 1], outputRange: [32, 20] }),
            borderBottomRightRadius: p.interpolate({ inputRange: [0, 1], outputRange: [32, 20] }),
          },
        ]}
      >
        <StatusBar style="light" />
        {nav}
        <Animated.View
          style={{
            marginTop: 12,
            opacity: p.interpolate({ inputRange: [0, 0.45, 1], outputRange: [1, 0, 0] }),
            transformOrigin: '50% 0',
            transform: [
              { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) },
              { scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] }) },
            ],
          }}
        >
          <ToolsLineup width={width} paused={art.paused} />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View onLayout={onLayout} style={[styles.header, { backgroundColor: colors.brand }]}>
      <StatusBar style="light" />
      {nav}
      {art.kind === 'door' && (
        <DoorArt mode={art.mode} offset={art.offset} teeth={art.teeth} go={art.go} shake={art.shake} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden', zIndex: 3 },
  collapsing: { position: 'absolute', left: 0, right: 0, top: 0 },
  row: {
    height: undefined,
    minHeight: NAV_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
