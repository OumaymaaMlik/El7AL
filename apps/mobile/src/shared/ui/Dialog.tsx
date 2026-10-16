import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { radius, space } from '../theme/tokens';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

interface DialogProps {
  visible: boolean;
  /** Called by the close button, a tap outside, and the hardware back button. Omit for a dialog that needs an answer. */
  onClose?: () => void;
  title: string;
  subtitle?: string;
  /** Optional icon shown in a round badge above the title. */
  icon?: React.ReactNode;
  /** Colours the icon badge for destructive questions. */
  tone?: 'default' | 'danger';
  children?: React.ReactNode;
}

/**
 * The one dialog for the app: an opaque panel that rises from the bottom over a dimmed page.
 * Use it for a decision or a short task. For a list or a form, use `BottomSheet`.
 */
export function Dialog({ visible, onClose, title, subtitle, icon, tone = 'default', children }: DialogProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
      >
        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('close')}
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        )}
        <View
          accessibilityViewIsModal
          style={[
            styles.panel,
            { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, space.lg) + space.sm },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          {(icon || onClose) && (
            <View style={styles.top}>
              {icon ? (
                <View
                  style={[styles.iconBadge, { backgroundColor: tone === 'danger' ? colors.dangerSoft : colors.raised }]}
                >
                  {icon}
                </View>
              ) : (
                <View />
              )}
              {onClose && (
                <IconButton accessibilityLabel={t('close')} onPress={onClose}>
                  <X size={18} color={colors.text} />
                </IconButton>
              )}
            </View>
          )}

          <View style={styles.text}>
            <Txt variant="title" accessibilityRole="header" style={styles.title}>
              {title}
            </Txt>
            {Boolean(subtitle) && (
              <Txt variant="body" color={colors.textMuted}>
                {subtitle}
              </Txt>
            )}
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Stacks a dialog's buttons with the standard gap. */
export function DialogActions({ children }: { children: React.ReactNode }) {
  return <View style={styles.actions}>{children}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    gap: space.lg,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 0,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    gap: space.sm,
  },
  // Dialog titles are one step below a page title.
  title: {
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.9,
  },
  actions: {
    gap: 10,
  },
});
