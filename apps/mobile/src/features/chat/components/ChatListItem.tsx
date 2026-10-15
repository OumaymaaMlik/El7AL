import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Hairline } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { numeralFont } from '../../../shared/theme/typography';
import { space } from '../../../shared/theme/tokens';
import { formatDate } from '../../../shared/utils/format';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';
import type { Mission } from '../../missions';
import { useChatStore } from '../store/useChatStore';
import { contactAvatarOf, contactNameOf } from '../utils/contact';

interface Props {
  item: Mission;
  index: number;
  onOpen: (mission: Mission) => void;
}

export function ChatListItem({ item, index, onOpen }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const unreadCount = useChatStore((state) => state.unreadCounts[item.id] || 0);
  const hasUnread = unreadCount > 0;

  const isProvider = user?.role === 'PROVIDER';
  const contactName = contactNameOf(item, isProvider, t);
  const meta = [item.category?.name, item.addressText].filter(Boolean).join(' · ');
  const lastMsg = item.messages && item.messages.length > 0 ? item.messages[item.messages.length - 1] : null;
  const snippet = lastMsg
    ? lastMsg.senderId === user?.id
      ? `Vous : ${lastMsg.content}`
      : lastMsg.content
    : item.description || meta;

  return (
    <>
      {index > 0 && <Hairline />}
      <Pressable
        accessibilityRole="button"
        onPress={() => onOpen(item)}
        style={({ pressed }) => [
          styles.row,
          hasUnread && [styles.rowUnread, { borderLeftColor: colors.brand }],
          pressed && { backgroundColor: colors.raised },
        ]}
      >
        <View>
          <Avatar uri={contactAvatarOf(item, isProvider)} name={contactName} size={44} />
          {hasUnread && <View style={[styles.unreadDot, { backgroundColor: colors.brand }]} />}
        </View>

        <View style={styles.flex}>
          <View style={styles.top}>
            <Txt
              variant="bodyStrong"
              numberOfLines={1}
              style={[styles.flex, hasUnread && { color: colors.text, fontWeight: '700' }]}
            >
              {contactName}
            </Txt>
            <Txt
              variant="caption"
              color={hasUnread ? colors.accentText : colors.textMuted}
              style={hasUnread ? { fontWeight: '700' } : undefined}
            >
              {formatDate(lastMsg?.createdAt || item.createdAt, language)}
            </Txt>
          </View>

          {Boolean(meta) && (
            <Txt variant="small" color={colors.textSecondary} numberOfLines={1}>
              {meta}
            </Txt>
          )}

          <View style={styles.snippetRow}>
            <Txt
              variant={hasUnread ? 'smallStrong' : 'small'}
              color={hasUnread ? colors.text : colors.textMuted}
              numberOfLines={1}
              style={[styles.flex, hasUnread && { fontWeight: '600' }]}
            >
              {snippet}
            </Txt>
            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        <Mirrored>
          <ChevronRight size={18} color={hasUnread ? colors.accentText : colors.textMuted} />
        </Mirrored>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14 },
  rowUnread: { borderLeftWidth: 3.5, paddingLeft: 10.5 },
  top: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  snippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#DC2626',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: numeralFont, fontWeight: '700', lineHeight: 14 },
});
