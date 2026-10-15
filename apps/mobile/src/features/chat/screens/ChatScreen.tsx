import React, { useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
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

export function ChatScreen() {
  const insets = useSafeAreaInsets();
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
        headerComponent={<ScreenHeader title={t('messagingTitle')} subtitle={t('messagingSub')} />}
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
            <ScreenHeader
              title={contactNameOf(selected, isProvider, t)}
              subtitle={[selected.category?.name, selected.addressText].filter(Boolean).join(' · ')}
              onBack={discussion.close}
              trailing={null}
            />
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
  discussionLayer: {
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
});
