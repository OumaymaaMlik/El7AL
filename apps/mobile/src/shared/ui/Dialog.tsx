import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { Shadows } from '../theme/colors';
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
 * The one centred dialog for the app: an opaque panel over a dimmed page.
 * Use it for a decision or a short task. For a list or a form, use `BottomSheet`.
 */
export function Dialog({ visible, onClose, title, subtitle, icon, tone = 'default', children }: DialogProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

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
          style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
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
                <IconButton
                  accessibilityLabel={t('close')}
                  onPress={onClose}
                  style={{ backgroundColor: colors.raised, borderWidth: 0 }}
                >
                  <X size={18} color={colors.text} />
                </IconButton>
              )}
            </View>
          )}

          <View style={styles.text}>
            <Txt variant="heading" accessibilityRole="header">
              {title}
            </Txt>
            {Boolean(subtitle) && (
              <Txt variant="small" color={colors.textSecondary}>
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
    justifyContent: 'center',
    padding: space.xl,
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.xl,
    gap: space.lg,
    ...Shadows.soft,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 0,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    gap: space.xs,
  },
  actions: {
    gap: space.sm,
  },
});
