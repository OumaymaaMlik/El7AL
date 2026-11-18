import { StyleSheet, View } from 'react-native';
import { Check, CheckCheck, Clock } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { ThreadMessage } from '../hooks/useChatThread';
import { formatMessageTime } from '../utils/formatTime';

interface Props {
  message: ThreadMessage;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t, language } = useTranslation();
  const time = formatMessageTime(message.createdAt, language);
  const pendingStyle = message.pending && styles.pending;

  if (isMine) {
    return (
      <View style={[styles.row, styles.mine]}>
        <View
          style={[
            styles.bubble,
            styles.bubbleMine,
            { backgroundColor: colors.brand, borderColor: colors.brand },
            pendingStyle,
          ]}
        >
          <Txt variant="body" color={colors.onBrand}>
            {message.content}
          </Txt>
        </View>
        <View style={styles.status}>
          {message.pending ? (
            <>
              <Clock size={11} color={colors.textMuted} />
              <Txt variant="caption" color={colors.textMuted}>
                {t('sending')}
              </Txt>
            </>
          ) : message.isRead ? (
            <>
              <Txt variant="caption" color={colors.accentText}>
                {time} · {t('seen')}
              </Txt>
              <CheckCheck size={14} color={colors.accentText} strokeWidth={2.4} />
            </>
          ) : (
            <>
              <Txt variant="caption" color={colors.textMuted}>
                {time} · {t('sent')}
              </Txt>
              <Check size={13} color={colors.textMuted} strokeWidth={2.2} />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.theirs]}>
      <View
        style={[
          styles.bubble,
          styles.bubbleTheirs,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pendingStyle,
        ]}
      >
        <Txt variant="body" color={colors.text}>
          {message.content}
        </Txt>
      </View>
      {Boolean(time) && (
        <Txt variant="caption" color={colors.textMuted} style={styles.theirsTime}>
          {time}
        </Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { maxWidth: 290, gap: 3 },
  mine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  // The prototype's bubbles: round on three corners, a small 6px corner on the speaker's side.
  bubble: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6 },
  pending: { opacity: 0.6 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, paddingHorizontal: 2 },
  theirsTime: { marginTop: 2, paddingHorizontal: 2 },
});
