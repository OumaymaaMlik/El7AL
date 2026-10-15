import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { Shadows } from '../theme/colors';
import { radius, space } from '../theme/tokens';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Optional control shown next to the close button (for example a back or clear button). */
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The one bottom sheet for the app: an opaque panel that slides up over a dimmed
 * page, with a title, a close button and room for the device's bottom inset.
 * Tapping the dimmed area or the hardware back button closes it.
 */
export function BottomSheet({ visible, onClose, title, subtitle, headerAction, children }: BottomSheetProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(400);
      Animated.spring(slide, {
        toValue: 0,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slide]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View style={{ transform: [{ translateY: slide }] }}>
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                paddingBottom: Math.max(insets.bottom, space.lg) + space.sm,
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Txt variant="heading" accessibilityRole="header">
                  {title}
                </Txt>
                {Boolean(subtitle) && (
                  <Txt variant="small" color={colors.textSecondary}>
                    {subtitle}
                  </Txt>
                )}
              </View>
              {headerAction}
              <IconButton
                accessibilityLabel={t('close')}
                onPress={onClose}
                style={{ backgroundColor: colors.raised, borderWidth: 0 }}
              >
                <X size={18} color={colors.text} />
              </IconButton>
            </View>

            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    ...Shadows.soft,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    marginBottom: space.lg,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
});
