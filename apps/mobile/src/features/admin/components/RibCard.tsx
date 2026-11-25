import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Surface } from '../../../shared/ui/Surface';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { logger } from '../../../shared/utils/logger';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { fetchRib, updateRib } from '../api/admin.api';
import { styles } from './AdminTabs.styles';

function useRib() {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((s) => s.flashToast);
  /** Undefined until loaded; null when no account is set. */
  const [rib, setRib] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetchRib()
      .then(setRib)
      .catch((e) => logger.warn('Bank account load failed:', e));

  useEffect(() => {
    void load();
  }, []);

  /** Returns true when the server accepted the account. */
  const save = async (value: string): Promise<boolean> => {
    setSaving(true);
    try {
      await updateRib(value);
      await load();
      flashToast({ title: t('ribSaved'), message: t('ribSavedText'), tone: 'success' });
      return true;
    } catch (e) {
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t('ribSaveFailed')), tone: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { rib, saving, save };
}

/** The bank account artisans transfer to, with the button that changes it. */
export function RibCard() {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const { rib, saving, save } = useRib();
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Surface style={styles.topupCard}>
      <Txt variant="small" color={colors.textMuted}>
        {t('ribLabel')}
      </Txt>
      <Txt variant="bodyStrong" selectable>
        {rib === undefined ? '—' : (rib ?? t('ribNone'))}
      </Txt>
      <Button title={t('ribChange')} variant="secondary" onPress={() => setDraft(rib ?? '')} />
      <BottomSheet
        visible={draft !== null}
        onClose={() => setDraft(null)}
        title={t('ribChange')}
        subtitle={t('ribHint')}
      >
        <View style={styles.list}>
          <Input
            label={t('ribNew')}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={50}
            value={draft ?? ''}
            onChangeText={setDraft}
          />
          <Button
            title={t('save')}
            loading={saving}
            disabled={!draft?.trim()}
            onPress={() => void save(draft ?? '').then((ok) => ok && setDraft(null))}
          />
        </View>
      </BottomSheet>
    </Surface>
  );
}
