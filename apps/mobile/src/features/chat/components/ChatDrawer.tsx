import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ChatThread } from './ChatThread';
import { IconButton } from '../../../shared/ui/IconButton';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  missionId: string;
}

/** The conversation for a mission, opened full screen from Tracking. */
export function ChatDrawer({ visible, onClose, missionId }: ChatDrawerProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title={t('directDiscussion')}
          trailing={
            <IconButton accessibilityLabel={t('close')} onPress={onClose}>
              <X size={20} color={colors.text} />
            </IconButton>
          }
        />
        <View style={styles.thread}>
          {visible && Boolean(missionId) && <ChatThread missionId={missionId} bottomInset={insets.bottom} />}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  thread: {
    flex: 1,
  },
});
