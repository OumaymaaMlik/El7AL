import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ChevronRight, Clock, FileText, LogOut, ShieldCheck, Trash2 } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { controlHeight, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  isAdmin: boolean;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onOpenPrivacy: () => void;
  onDeleteAccount: () => void;
}

export function ProfileActions({
  isAdmin,
  onOpenHistory,
  onOpenAdmin,
  onLogout,
  onOpenPrivacy,
  onDeleteAccount,
}: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const rowStyle = ({ pressed }: { pressed: boolean }) => [styles.row, pressed && { backgroundColor: colors.raised }];

  return (
    <Surface>
      <Pressable accessibilityRole="button" onPress={onOpenHistory} style={rowStyle}>
        <Clock size={18} color={colors.textMuted} />
        <Txt variant="bodyMedium" style={styles.flex}>
          {t('historyTitle')}
        </Txt>
        <Mirrored>
          <ChevronRight size={18} color={colors.textMuted} />
        </Mirrored>
      </Pressable>
      {isAdmin && (
        <>
          <Hairline />
          <Pressable accessibilityRole="button" onPress={onOpenAdmin} style={rowStyle}>
            <ShieldCheck size={18} color={colors.textMuted} />
            <Txt variant="bodyMedium" style={styles.flex}>
              {t('adminPortalTitle')}
            </Txt>
            <Mirrored>
              <ChevronRight size={18} color={colors.textMuted} />
            </Mirrored>
          </Pressable>
        </>
      )}
      <Hairline />
      <Pressable accessibilityRole="button" onPress={onOpenPrivacy} style={rowStyle}>
        <FileText size={18} color={colors.textMuted} />
        <Txt variant="bodyMedium" style={styles.flex}>
          {t('privacyPolicyTitle')}
        </Txt>
        <Mirrored>
          <ChevronRight size={18} color={colors.textMuted} />
        </Mirrored>
      </Pressable>
      <Hairline />
      <Pressable accessibilityRole="button" onPress={onLogout} style={rowStyle}>
        <Mirrored>
          <LogOut size={18} color={colors.dangerText} />
        </Mirrored>
        <Txt variant="bodyMedium" color={colors.dangerText} style={styles.flex}>
          {t('logout')}
        </Txt>
      </Pressable>
      {!isAdmin && (
        <>
          <Hairline />
          <Pressable accessibilityRole="button" onPress={onDeleteAccount} style={rowStyle}>
            <Trash2 size={18} color={colors.dangerText} />
            <Txt variant="bodyMedium" color={colors.dangerText} style={styles.flex}>
              {t('deleteAccount')}
            </Txt>
          </Pressable>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    minHeight: controlHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
});
