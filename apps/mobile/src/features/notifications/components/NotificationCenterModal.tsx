import React, { useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, X } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { useSlideSheet } from '../hooks/useSlideSheet';
import { useNotificationStore } from '../store/useNotificationStore';
import { groupNotifications } from '../utils/groupNotifications';
import { notificationPalette } from '../utils/palette';
import { NotificationRow } from './NotificationRows';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationCenterModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const colors = useThemeStore((state) => state.colors);
  const isDark = colors.background === '#0B1410';
  const palette = notificationPalette(isDark);
  const { t, language } = useTranslation();

  const notifications = useNotificationStore((state) => state.notifications);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  const [confirmingClear, setConfirmingClear] = useState(false);
  const { translateY, close } = useSlideSheet(visible, onClose, () => setConfirmingClear(false));
  const openNotification = useNotificationNavigation(close);

  const totalUnread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const sections = useMemo(() => groupNotifications(notifications, t, language), [notifications, language, t]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close')}
          style={[styles.backdrop, { backgroundColor: 'rgba(14, 31, 22, 0.55)' }]}
          onPress={close}
        />

        <Animated.View
          style={[
            styles.sheet,
            { height: Math.min(height * 0.85, 780), backgroundColor: palette.sheetBg, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handleBar, { backgroundColor: palette.handle }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, { color: palette.textTitle }]}>
                {t('notifications') || 'Notifications'}
              </Text>
              {totalUnread > 0 ? (
                <Text style={[styles.headerUnread, { color: palette.unreadGreen }]}>
                  {totalUnread} {t('unreadCountLabel')?.replace('{n}', '') || 'non lues'}
                </Text>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={close}
              style={[styles.closeBtn, { backgroundColor: palette.cardBg, borderColor: palette.closeBorder }]}
            >
              <X size={20} color={palette.textTitle} strokeWidth={2.2} />
            </Pressable>
          </View>

          {notifications.length > 0 && (
            <View style={styles.actionsRow}>
              <Pressable accessibilityRole="button" onPress={markAllAsRead} style={styles.actionBtn}>
                <Text style={[styles.actionMarkText, { color: palette.greenBrand }]}>
                  {t('markAllAsRead') || 'Tout marquer comme lu'}
                </Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setConfirmingClear(true)} style={styles.actionBtn}>
                <Text style={[styles.actionClearText, { color: palette.redDanger }]}>
                  {t('clearAll') || 'Tout effacer'}
                </Text>
              </Pressable>
            </View>
          )}

          {confirmingClear && (
            <View style={[styles.confirmBox, { backgroundColor: palette.confirmBg, borderColor: palette.redDanger }]}>
              <Text style={[styles.confirmText, { color: palette.textTitle }]}>
                {t('clearAllConfirm') || 'Effacer toutes les notifications ?'}
              </Text>
              <View style={styles.confirmBtnRow}>
                <Pressable
                  onPress={() => setConfirmingClear(false)}
                  style={[styles.confirmBtn, { backgroundColor: palette.cardBg }]}
                >
                  <Text style={[styles.confirmBtnCancelText, { color: palette.textTitle }]}>
                    {t('cancel') || 'Annuler'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    clearNotifications();
                    setConfirmingClear(false);
                  }}
                  style={[styles.confirmBtn, { backgroundColor: palette.redDanger }]}
                >
                  <Text style={styles.confirmBtnDeleteText}>{t('delete') || 'Effacer'}</Text>
                </Pressable>
              </View>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconBox, { backgroundColor: palette.emptyIconBg }]}>
                  <Bell size={28} color={palette.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: palette.textTitle }]}>
                  {t('noNotifications') || 'Aucune notification'}
                </Text>
                <Text style={[styles.emptySub, { color: palette.textMuted }]}>
                  {t('noNotificationsSub') || 'Vous êtes à jour, rien à signaler.'}
                </Text>
              </View>
            ) : (
              sections.map((section) => (
                <View key={section.key} style={styles.sectionWrap}>
                  <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>{section.title}</Text>
                  <View
                    style={[styles.sectionCard, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}
                  >
                    {section.items.map((item, idx) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        palette={palette}
                        isDark={isDark}
                        showDivider={idx > 0}
                        onPress={openNotification}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 20,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitleWrap: { gap: 2 },
  headerTitle: { fontSize: 22, lineHeight: 26, fontWeight: '800', letterSpacing: -0.4 },
  headerUnread: { fontSize: 13, fontWeight: '600' },
  closeBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 44,
  },
  actionBtn: { height: 44, justifyContent: 'center' },
  actionMarkText: { fontSize: 14, fontWeight: '700' },
  actionClearText: { fontSize: 14, fontWeight: '600' },
  confirmBox: { marginHorizontal: 20, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  confirmText: { fontSize: 14, fontWeight: '600' },
  confirmBtnRow: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  confirmBtnCancelText: { fontSize: 13, fontWeight: '600' },
  confirmBtnDeleteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
  sectionWrap: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});
