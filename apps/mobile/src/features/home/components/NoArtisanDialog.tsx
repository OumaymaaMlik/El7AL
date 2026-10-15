import React from 'react';
import { MapPinOff } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog } from '../../../shared/ui/Dialog';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

/** Shown when the search timed out without finding an artisan in range. */
export function NoArtisanDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={t('noArtisanInRangeTitle')}
      subtitle={t('noArtisanInRangeMsg')}
      icon={<MapPinOff size={24} color={colors.accentText} />}
    >
      <Button title={t('understood')} variant="primary" onPress={onClose} />
    </Dialog>
  );
}
