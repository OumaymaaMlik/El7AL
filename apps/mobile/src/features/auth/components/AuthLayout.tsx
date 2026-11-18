import React from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { gutter } from '../../../shared/theme/tokens';

interface AuthLayoutProps {
  /** The green header (`AuthHeader`). */
  header: React.ReactNode;
  /**
   * Set when the header floats over the form and collapses (sign-up): its expanded height becomes the top
   * padding of the form, and the scroll offset is reported through `onScroll`.
   */
  overlayHeight?: number;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Called when a scroll gesture ends, so the header can settle open or closed. */
  onScrollEnd?: (y: number) => void;
  /** The scroll view, for settling the header. */
  scrollRef?: React.Ref<KeyboardAwareScrollView>;
  /** A fixed footer under the scrolling form (the sign-up button). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** What every access screen after Welcome sits on: the green header, then a keyboard-aware form on the page colour. */
export function AuthLayout({
  header,
  overlayHeight,
  onScroll,
  onScrollEnd,
  scrollRef,
  footer,
  children,
}: AuthLayoutProps) {
  const colors = useThemeStore((state) => state.colors);
  const insets = useSafeAreaInsets();
  const overlay = overlayHeight !== undefined;
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!overlay && header}
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: overlay ? overlayHeight + 24 : 26,
            paddingBottom: footer ? 24 : Math.max(insets.bottom, 16) + 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => onScrollEnd?.(e.nativeEvent.contentOffset.y)}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) =>
          onScrollEnd?.(e.nativeEvent.contentOffset.y)
        }
      >
        {children}
      </KeyboardAwareScrollView>
      {footer && (
        <View
          style={[styles.footer, { borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) + 18 }]}
        >
          {footer}
        </View>
      )}
      {overlay && header}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: gutter + 4, gap: 14 },
  footer: { paddingHorizontal: gutter + 4, paddingTop: 14, borderTopWidth: 1 },
});
