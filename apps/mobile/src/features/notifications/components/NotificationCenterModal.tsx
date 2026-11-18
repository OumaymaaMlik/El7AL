import { useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationNavigation } from '../hooks/useNotificationNavigation';
import { useSlideSheet } from '../hooks/useSlideSheet';
import { useNotificationStore } from '../store/useNotificationStore';
import { groupNotifications } from '../utils/groupNotifications';
import { notificationPalette } from '../utils/palette';
import { NotificationRow } from './NotificationRows';
import { useTopPad } from '../../../shared/theme/useTopPad';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationCenterModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const { height } = useWindowDimensions();
  const isDark = useThemeStore((state) => state.mode) === 'dark';
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
            { height, backgroundColor: palette.sheetBg, paddingTop: topPad, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.navRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('close')}
              onPress={close}
              style={[styles.closeBtn, { backgroundColor: palette.cardBg, borderColor: palette.closeBorder }]}
            >
              <Mirrored>
                <ChevronLeft size={20} color={palette.textTitle} strokeWidth={2.2} />
              </Mirrored>
            </Pressable>
            {notifications.length > 0 && (
              <Pressable accessibilityRole="button" onPress={markAllAsRead} hitSlop={10}>
                <Text style={[styles.actionMarkText, { color: palette.greenBrand }]}>{t('readAll')}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: palette.textTitle }]}>
              {t('notifications') || 'Notifications'}
            </Text>
            {totalUnread > 0 ? (
              <Text style={[styles.headerUnread, { color: palette.unreadGreen }]}>
                {totalUnread} {t('unreadCountLabel')?.replace('{n}', '') || 'non lues'}
              </Text>
            ) : null}
          </View>

          {notifications.length > 0 && (
            <View style={styles.actionsRow}>
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
                  <View style={styles.sectionList}>
                    {section.items.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        palette={palette}
                        isDark={isDark}
                        showDivider={false}
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
  sheet: { overflow: 'hidden' },
  navRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6, gap: 2 },
  headerTitle: { fontSize: 32, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  headerUnread: { fontSize: 13, fontWeight: '600' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
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
  confirmBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  confirmBtnCancelText: { fontSize: 13, fontWeight: '600' },
  confirmBtnDeleteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
  sectionWrap: { marginTop: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 8 },
  sectionList: { gap: 8 },
});
