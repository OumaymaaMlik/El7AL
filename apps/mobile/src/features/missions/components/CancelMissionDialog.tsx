import React from 'react';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog, DialogActions } from '../../../shared/ui/Dialog';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  visible: boolean;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelMissionDialog({ visible, cancelling, onClose, onConfirm }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={t('cancelDialogTitle')}
      subtitle={t('cancelDialogBody')}
      tone="danger"
      icon={<AlertTriangle size={24} color={colors.dangerText} />}
    >
      <DialogActions>
        <Button title={t('confirmCancel')} variant="destructive" onPress={onConfirm} loading={cancelling} />
        <Button title={t('keepMission')} variant="outline" onPress={onClose} disabled={cancelling} />
      </DialogActions>
    </Dialog>
  );
}
