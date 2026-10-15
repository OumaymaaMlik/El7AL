import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Bell, CheckCircle2, MessageSquare, XCircle, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import type { DisplayNotification, GroupedChatNotification, SingleNotification } from '../utils/groupNotifications';
import type { NotificationType } from '../store/useNotificationStore';
import type { NotificationPalette } from '../utils/palette';

const ICONS: Record<NotificationType, LucideIcon> = {
  CHAT: MessageSquare,
  OFFER: Zap,
  ACCEPT: CheckCircle2,
  CANCEL: XCircle,
  COMPLETED: CheckCircle2,
  SYSTEM: Bell,
};

interface RowProps {
  item: DisplayNotification;
  palette: NotificationPalette;
  isDark: boolean;
  showDivider: boolean;
  onPress: (item: DisplayNotification) => void;
}

/** One entry of the notification center: a chat conversation or a system notification. */
export function NotificationRow({ item, palette, isDark, showDivider, onPress }: RowProps) {
  const unread = item.isChat ? item.isUnread : !item.read;
  return (
    <>
      {showDivider && <View style={[styles.hairline, { backgroundColor: palette.hairline }]} />}
      <Pressable
        accessibilityRole="button"
        onPress={() => onPress(item)}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: unread ? palette.unreadItemBg : palette.cardBg },
          pressed && { opacity: 0.8 },
        ]}
      >
        {item.isChat ? (
          <ChatContent item={item} palette={palette} unread={unread} />
        ) : (
          <SystemContent item={item} palette={palette} isDark={isDark} />
        )}
      </Pressable>
    </>
  );
}

function ChatContent({
  item,
  palette,
  unread,
}: {
  item: GroupedChatNotification;
  palette: NotificationPalette;
  unread: boolean;
}) {
  const badgeBorder = unread ? palette.unreadItemBg : palette.cardBg;
  return (
    <>
      <View style={styles.avatarWrap}>
        <Avatar
          uri={item.senderAvatar}
          name={item.senderName}
          size={44}
          tint={{ background: '#0F5B3A', color: '#FFFFFF' }}
        />
        {/* Tiny lime badge with a message icon at the bottom-right corner */}
        <View style={[styles.avatarBadge, { borderColor: badgeBorder }]}>
          <MessageSquare size={10} color="#0E1F16" strokeWidth={3} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.textTitle }]} numberOfLines={1}>
            {item.senderName}
          </Text>
          <Text style={[styles.time, { color: palette.textMuted }]}>{item.timestamp}</Text>
        </View>
        <View style={styles.bodyRow}>
          <Text style={[styles.message, { color: palette.textSub }]} numberOfLines={1}>
            {item.message}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.countPill, { backgroundColor: palette.greenBrand }]}>
              <Text style={styles.countPillText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

function SystemContent({
  item,
  palette,
  isDark,
}: {
  item: SingleNotification;
  palette: NotificationPalette;
  isDark: boolean;
}) {
  const tone =
    item.tone ||
    (item.type === 'CANCEL' ? 'error' : item.type === 'ACCEPT' || item.type === 'COMPLETED' ? 'success' : 'info');
  const isError = tone === 'error';
  const isSuccess = tone === 'success';

  const Icon = isError ? AlertTriangle : isSuccess ? CheckCircle2 : ICONS[item.type] || Bell;
  const background = isError
    ? isDark
      ? '#2A1717'
      : '#FEE2E2'
    : isSuccess
      ? isDark
        ? '#1A3324'
        : '#E2F5B5'
      : isDark
        ? '#1E293B'
        : '#E0F2FE';
  const color = isError ? '#DC2626' : isSuccess ? palette.greenBrand : '#0284C7';

  return (
    <>
      <View style={[styles.systemIconBox, { backgroundColor: background }]}>
        <Icon size={22} color={color} strokeWidth={2.2} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.textTitle }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.time, { color: palette.textMuted }]}>{item.timestamp}</Text>
        </View>
        {Boolean(item.message) && (
          <Text style={[styles.message, { color: palette.textSub }]} numberOfLines={1}>
            {item.message}
          </Text>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hairline: { height: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  avatarWrap: { position: 'relative', width: 44, height: 44 },
  avatarBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B4EB3B',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, gap: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', letterSpacing: -0.15, flex: 1 },
  time: { fontSize: 12, fontWeight: '500' },
  bodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  message: { fontSize: 14, fontWeight: '500', flex: 1 },
  countPill: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
