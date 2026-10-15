import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MessageSquare, Phone } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { hitTarget, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

export interface PrimaryAction {
  title: string;
  onPress: () => void;
  Icon: LucideIcon;
  busy: boolean;
}

interface Props {
  primary: PrimaryAction | null;
  onChat: () => void;
  onCall: () => void;
  onCancel: () => void;
}

/** One primary (lime) action at a time; when there is one, the chat button steps back. */
export function TrackingActions({ primary, onChat, onCall, onCancel }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <View style={styles.actions}>
      {primary && (
        <Button
          title={primary.title}
          onPress={primary.onPress}
          loading={primary.busy}
          iconPosition="left"
          icon={<primary.Icon size={18} color={colors.onAction} />}
        />
      )}
      <Button
        title={t('openDirectChat')}
        variant={primary ? 'outline' : 'accent'}
        onPress={onChat}
        iconPosition="left"
        icon={<MessageSquare size={18} color={primary ? colors.accentText : colors.onAction} />}
      />
      <Button
        title={t('callDirectly')}
        variant="outline"
        onPress={onCall}
        iconPosition="left"
        icon={<Phone size={18} color={colors.accentText} />}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.7 }]}
      >
        <Txt variant="bodyMedium" color={colors.dangerText}>
          {t('cancelMission')}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: space.sm },
  cancel: { minHeight: hitTarget, justifyContent: 'center', alignItems: 'center' },
});
