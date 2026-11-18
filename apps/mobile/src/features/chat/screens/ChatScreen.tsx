import { useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Search } from 'lucide-react-native';
import { Avatar } from '../../../shared/ui/Avatar';
import { LiveDot } from '../../../shared/ui/LiveDot';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';
import { InstagramPullToRefresh } from '../../../shared/ui/InstagramPullToRefresh';
import { Input } from '../../../shared/ui/Input';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { gutter, space, tabBarHeight } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useAuthStore } from '../../auth';
import { ChatThread } from '../components/ChatThread';
import { ConversationList } from '../components/ConversationList';
import { useConversations } from '../hooks/useConversations';
import { useDiscussion } from '../hooks/useDiscussion';
import { contactAvatarOf, contactNameOf } from '../utils/contact';
import { useTopPad } from '../../../shared/theme/useTopPad';

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const topPad = useTopPad();
  const params = useLocalSearchParams<{ missionId?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const isProvider = useAuthStore((state) => state.user?.role) === 'PROVIDER';

  const list = useConversations();
  const discussion = useDiscussion(params.missionId);
  const [query, setQuery] = useState('');

  const needle = query.toLowerCase();
  const filtered = list.conversations.filter(
    (c) =>
      contactNameOf(c, isProvider, t).toLowerCase().includes(needle) ||
      (c.category?.name || '').toLowerCase().includes(needle),
  );

  const bottomInset = Math.max(insets.bottom, 10);
  const selected = discussion.selected;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <InstagramPullToRefresh
        refreshing={list.refreshing}
        onRefresh={list.refresh}
        headerComponent={<ScreenHeader title={t('messagingTitle')} />}
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + bottomInset + space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {list.conversations.length > 0 && (
          <Input
            placeholder={t('searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            icon={<Search size={18} color={colors.textMuted} />}
            accessibilityLabel={t('searchPlaceholder')}
            returnKeyType="search"
          />
        )}
        <ConversationList
          loading={list.loading}
          total={list.conversations.length}
          conversations={filtered}
          onOpen={discussion.open}
        />
      </InstagramPullToRefresh>

      {selected && (
        <Animated.View
          {...discussion.panHandlers}
          style={[
            StyleSheet.absoluteFill,
            styles.discussionLayer,
            { backgroundColor: colors.background, transform: [{ translateX: discussion.translateX }] },
          ]}
        >
          <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View
              style={[
                styles.chatHeader,
                { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: topPad },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('back')}
                onPress={discussion.close}
                style={({ pressed }) => [
                  styles.round,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Mirrored>
                  <ChevronLeft size={20} color={colors.text} />
                </Mirrored>
              </Pressable>
              <Avatar
                uri={contactAvatarOf(selected, isProvider)}
                name={contactNameOf(selected, isProvider, t)}
                size={42}
                tint={{ background: colors.brand, color: colors.live }}
              />
              <View style={styles.flex}>
                <Txt variant="bodyStrong" numberOfLines={1} style={styles.chatName}>
                  {contactNameOf(selected, isProvider, t)}
                </Txt>
                <View style={styles.subRow}>
                  <LiveDot />
                  <Txt variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.flex}>
                    {[selected.category?.name, selected.addressText].filter(Boolean).join(' · ')}
                  </Txt>
                </View>
              </View>
            </View>
            <ChatThread
              missionId={selected.id}
              partnerName={contactNameOf(selected, isProvider, t)}
              partnerAvatar={contactAvatarOf(selected, isProvider)}
              bottomInset={tabBarHeight + bottomInset}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: gutter, paddingTop: space.xs, gap: space.lg },
  flex: { flex: 1, minWidth: 0 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chatName: { fontSize: 16, lineHeight: 20 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discussionLayer: {
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
});
