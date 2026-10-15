import React from 'react';
import { Image, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog, DialogActions } from '../../../shared/ui/Dialog';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

export function LogoutDialog({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={t('logoutConfirmTitle')}
      subtitle={t('logoutConfirmBody')}
      icon={<LogOut size={22} color={colors.dangerText} />}
      tone="danger"
    >
      <DialogActions>
        <Button title={t('logout')} variant="destructive" onPress={onConfirm} />
        <Button title={t('cancel')} variant="outline" onPress={onClose} />
      </DialogActions>
    </Dialog>
  );
}

export function AvatarZoomDialog({
  visible,
  onClose,
  title,
  uri,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  uri: string;
}) {
  const { t } = useTranslation();
  return (
    <Dialog visible={visible} onClose={onClose} title={title}>
      <View style={{ alignItems: 'center', marginVertical: space.md }}>
        <Image source={{ uri }} style={{ width: 250, height: 250, borderRadius: 125 }} resizeMode="cover" />
      </View>
      <DialogActions>
        <Button title={t('close') || 'Fermer'} variant="outline" onPress={onClose} />
      </DialogActions>
    </Dialog>
  );
}
