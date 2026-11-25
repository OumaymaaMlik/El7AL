import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Flag } from 'lucide-react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { space } from '../../../shared/theme/tokens';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { reportProblem } from '../api/mission.api';

/** "Report a problem" about one intervention, for its client or its artisan. El 7al's admins receive it. */
export function ReportProblem({ missionId }: { missionId: string }) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const flashToast = useNotificationStore((s) => s.flashToast);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = reason.trim().length >= 5;

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await reportProblem(missionId, reason.trim());
      setReason('');
      setOpen(false);
      flashToast({ title: t('reportSentTitle'), message: t('reportSentText'), tone: 'success' });
    } catch (e) {
      setError(getApiErrorMessage(e, t('reportFailed')));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
      >
        <Flag size={14} color={colors.textSecondary} strokeWidth={2.2} />
        <Txt variant="smallStrong" color={colors.textSecondary}>
          {t('reportButton')}
        </Txt>
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t('reportTitle')} subtitle={t('reportLead')}>
        <View style={styles.body}>
          <Input
            label={t('reportTitle')}
            placeholder={t('reportPlaceholder')}
            multiline
            maxLength={1000}
            value={reason}
            onChangeText={setReason}
          />
          {Boolean(error) && (
            <Txt variant="small" color={colors.dangerText} accessibilityRole="alert">
              {error}
            </Txt>
          )}
          <Button title={t('reportSend')} onPress={() => void send()} loading={sending} disabled={!ready} />
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40 },
  body: { gap: space.md },
});
