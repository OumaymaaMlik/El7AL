import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Txt } from '../../../shared/ui/Txt';
import { gutter, radius, space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useChatThread } from '../hooks/useChatThread';
import { ChatComposer } from './ChatComposer';
import { MessageBubble } from './MessageBubble';

interface ChatThreadProps {
  missionId: string;
  partnerName?: string;
  partnerAvatar?: string | null;
  /** Extra space under the composer, for a tab bar or the device's bottom inset. */
  bottomInset?: number;
}

/**
 * One conversation: the messages and the composer. Used by the Chat tab and by the chat
 * opened from Tracking, so both look and behave the same.
 *
 * A message appears as soon as it is sent, marked as sending, and is confirmed when the
 * server echoes it back.
 */
export function ChatThread({ missionId, partnerName, partnerAvatar, bottomInset = 0 }: ChatThreadProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const thread = useChatThread(missionId, partnerName, partnerAvatar);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={thread.scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {thread.loading ? (
          <>
            <Skeleton style={[styles.skeleton, { alignSelf: 'flex-start', width: '62%' }]} />
            <Skeleton style={[styles.skeleton, { alignSelf: 'flex-end', width: '48%' }]} />
            <Skeleton style={[styles.skeleton, { alignSelf: 'flex-start', width: '40%' }]} />
          </>
        ) : thread.messages.length === 0 ? (
          <Txt variant="small" color={colors.textMuted} style={styles.empty}>
            {t('openChatInfo')}
          </Txt>
        ) : (
          thread.messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id || idx}
              message={msg}
              isMine={msg.senderId === thread.userId}
              partnerName={thread.partner.name || partnerName}
              partnerAvatar={thread.partner.avatar || partnerAvatar}
            />
          ))
        )}
      </ScrollView>

      <ChatComposer onSend={thread.send} bottomInset={bottomInset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: gutter, paddingVertical: space.lg, gap: space.md, flexGrow: 1 },
  skeleton: { height: 44, borderRadius: radius.md },
  empty: { textAlign: 'center', marginTop: space.xxxl, paddingHorizontal: space.xl },
});
