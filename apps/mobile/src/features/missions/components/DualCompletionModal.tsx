import React from 'react';
import { CheckCircle2 } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog, DialogActions } from '../../../shared/ui/Dialog';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface DualCompletionModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

/** The client confirms that the work is finished. */
export function DualCompletionModal({ visible, onConfirm, onClose, loading = false }: DualCompletionModalProps) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={t('dualModalTitle')}
      subtitle={t('dualModalSub')}
      icon={<CheckCircle2 size={24} color={colors.accentText} />}
    >
      <DialogActions>
        <Button title={t('confirmWorkFinish')} onPress={onConfirm} loading={loading} />
        <Button title={t('notNow')} variant="outline" onPress={onClose} disabled={loading} />
      </DialogActions>
    </Dialog>
  );
}
