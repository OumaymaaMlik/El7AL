import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { TranslationKeys } from '../../../shared/i18n/translations';

interface Props {
  visible: boolean;
  cancelling: boolean;
  /** Reasons differ by who cancels: the client or the artisan. */
  isProvider: boolean;
  onClose: () => void;
  /** Gets the chosen reason, in the app's current language, to send with the cancellation. */
  onConfirm: (reason: string) => void;
}

const CLIENT_REASONS: TranslationKeys[] = ['reasonSolved', 'reasonTooLong', 'reasonOther'];
const PROVIDER_REASONS: TranslationKeys[] = ['reasonUnreachable', 'reasonTooFar', 'reasonOther'];

/** "Annuler la demande ?": a short sheet that asks why (one tap), then "Garder" or "Annuler". */
export function CancelMissionDialog({ visible, cancelling, isProvider, onClose, onConfirm }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const reasons = isProvider ? PROVIDER_REASONS : CLIENT_REASONS;
  const [picked, setPicked] = useState(0);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t('cancelDialogTitle')} subtitle={t('cancelWhy')}>
      <View style={styles.list} accessibilityRole="radiogroup">
        {reasons.map((key, i) => {
          const on = picked === i;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setPicked(i)}
              style={[
                styles.radio,
                {
                  backgroundColor: colors.surface,
                  borderColor: on ? colors.brand : colors.border,
                  borderWidth: on ? 1.5 : 1,
                },
              ]}
            >
              <View
                style={[styles.dot, { borderColor: on ? colors.brand : colors.borderStrong, borderWidth: on ? 6 : 2 }]}
              />
              <Txt variant="bodyStrong">{t(key)}</Txt>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.buttons}>
        <Button title={t('keepShort')} onPress={onClose} disabled={cancelling} style={styles.half} />
        <Button
          title={t('cancel')}
          variant="destructive"
          onPress={() => onConfirm(t(reasons[picked]))}
          loading={cancelling}
          style={styles.half}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  radio: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, paddingHorizontal: 16, borderRadius: 16 },
  dot: { width: 20, height: 20, borderRadius: 10 },
  buttons: { flexDirection: 'row', gap: 10, paddingTop: 6 },
  half: { flex: 1 },
});
