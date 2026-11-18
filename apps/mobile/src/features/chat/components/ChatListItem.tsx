import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { FadeUp } from '../../../shared/ui/FadeUp';
import { Hairline } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { numeralFont } from '../../../shared/theme/typography';
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

/** One conversation: the avatar, the name and when, the last line and the unread count. */
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
      ? `${t('you')} : ${lastMsg.content}`
      : lastMsg.content
    : item.description || meta;

  return (
    <FadeUp index={index}>
      {index > 0 && <Hairline style={styles.hairline} />}
      <Pressable
        accessibilityRole="button"
        onPress={() => onOpen(item)}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.raised }]}
      >
        <Avatar
          uri={contactAvatarOf(item, isProvider)}
          name={contactName}
          size={52}
          tint={{ background: colors.brand, color: colors.live }}
        />

        <View style={styles.flex}>
          <View style={styles.line}>
            <Txt variant="bodyStrong" numberOfLines={1} style={[styles.flex, styles.name]}>
              {contactName}
            </Txt>
            <Txt variant="captionStrong" color={hasUnread ? colors.accentText : colors.textMuted}>
              {formatDate(lastMsg?.createdAt || item.createdAt, language)}
            </Txt>
          </View>

          <View style={styles.line}>
            <Txt
              variant={hasUnread ? 'smallStrong' : 'small'}
              color={hasUnread ? colors.text : colors.textMuted}
              numberOfLines={1}
              style={styles.flex}
            >
              {snippet}
            </Txt>
            {hasUnread && (
              <View style={[styles.badge, { backgroundColor: colors.brand }]}>
                <Txt style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Txt>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </FadeUp>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  hairline: { marginStart: 78 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, lineHeight: 21 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: numeralFont, lineHeight: 14 },
});
