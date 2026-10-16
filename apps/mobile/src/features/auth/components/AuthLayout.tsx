import React from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { gutter, space } from '../../../shared/theme/tokens';
import { PixelBackground } from '../../../shared/ui/PixelBackground';

/** What every access screen sits on: the page colour, the pixel background and a keyboard-aware scroll area. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PixelBackground />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.sm, paddingBottom: Math.max(insets.bottom, space.lg) + space.xl },
        ]}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: gutter, gap: 18 },
});
