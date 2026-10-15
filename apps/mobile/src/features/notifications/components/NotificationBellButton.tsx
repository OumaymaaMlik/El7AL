import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotificationStore } from '../store/useNotificationStore';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { NotificationCenterModal } from './NotificationCenterModal';
import { IconButton } from '../../../shared/ui/IconButton';

export function NotificationBellButton() {
  const colors = useThemeStore((state) => state.colors);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const label = unreadCount > 0 ? `${t('notifications')} (${unreadCount})` : t('notifications');

  return (
    <>
      <IconButton accessibilityLabel={label} onPress={() => setModalOpen(true)}>
        <Bell size={20} color={colors.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.accentText, borderColor: colors.surface }]} />
        )}
      </IconButton>

      <NotificationCenterModal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    end: 9,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
