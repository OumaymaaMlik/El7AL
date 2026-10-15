import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheet } from '../../../shared/ui/BottomSheet';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Txt } from '../../../shared/ui/Txt';
import { space } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { deleteAccount } from '../api/profile.api';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called once the server has erased the account; the caller signs out. */
  onDeleted: () => void;
}

/** Asks for the password, then erases the account. Required by the app stores. */
export function DeleteAccountSheet({ visible, onClose, onDeleted }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const close = () => {
    setPassword('');
    setError(undefined);
    onClose();
  };

  const confirm = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await deleteAccount(password);
      setPassword('');
      onDeleted();
    } catch (err) {
      setError(getApiErrorMessage(err, t('deleteAccountFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={close} title={t('deleteAccount')}>
      <View style={styles.body}>
        <Txt variant="small" color={colors.textSecondary}>
          {t('deleteAccountWarning')}
        </Txt>
        <Input
          label={t('deleteAccountPassword')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          error={error}
        />
        <Button
          title={t('deleteAccountConfirm')}
          variant="destructive"
          onPress={confirm}
          loading={loading}
          disabled={password.length === 0}
        />
        <Button title={t('cancel')} variant="outline" onPress={close} disabled={loading} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.lg },
});
