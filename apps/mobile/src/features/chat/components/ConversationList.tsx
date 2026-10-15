import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, MessageSquare } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { Hairline, Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { ROUTES } from '../../../navigation/routes';
import { useAuthStore } from '../../auth';
import type { Mission } from '../../missions';
import { ChatListItem } from './ChatListItem';

interface Props {
  loading: boolean;
  total: number;
  conversations: Mission[];
  onOpen: (mission: Mission) => void;
}

/** Skeleton, empty state, "no search results" or the list of conversations. */
export function ConversationList({ loading, total, conversations, onOpen }: Props) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const isProvider = useAuthStore((state) => state.user?.role) === 'PROVIDER';

  if (loading) {
    return (
      <Surface>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && <Hairline />}
            <View style={styles.skeletonRow}>
              <Skeleton style={{ width: 44, height: 44, borderRadius: 22 }} />
              <View style={styles.flex}>
                <Skeleton style={{ width: '50%', height: 16 }} />
                <Skeleton style={{ width: '75%', height: 12, marginTop: 8 }} />
              </View>
            </View>
          </React.Fragment>
        ))}
      </Surface>
    );
  }

  if (total === 0) {
    return (
      <Surface>
        <EmptyState
          icon={<MessageSquare size={24} color={colors.accentText} />}
          title={t('noConversations')}
          message={t('noConversationsSub')}
          action={
            !isProvider ? (
              <Button
                title={t('searchTechnician')}
                onPress={() => router.push(ROUTES.home)}
                icon={
                  <Mirrored>
                    <ArrowRight size={18} color={colors.onAction} />
                  </Mirrored>
                }
              />
            ) : undefined
          }
        />
      </Surface>
    );
  }

  if (conversations.length === 0) {
    return (
      <Surface style={styles.padded}>
        <Txt variant="small" color={colors.textMuted}>
          {t('noSearchResults')}
        </Txt>
      </Surface>
    );
  }

  return (
    <Surface>
      {conversations.map((item, index) => (
        <ChatListItem key={item.id} item={item} index={index} onOpen={onOpen} />
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { padding: space.lg },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14 },
});
