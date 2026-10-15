import React from 'react';
import { LogOut, ShieldX, Trash2 } from 'lucide-react-native';
import { Button } from '../../../shared/ui/Button';
import { Dialog, DialogActions } from '../../../shared/ui/Dialog';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { AdminActions } from '../hooks/useAdminActions';

/** Confirmations for the actions that cannot be undone. */
export function AdminDialogs({
  actions,
  logoutOpen,
  onCloseLogout,
  onLogout,
}: {
  actions: AdminActions;
  logoutOpen: boolean;
  onCloseLogout: () => void;
  onLogout: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const trash = <Trash2 size={22} color={colors.dangerText} />;

  return (
    <>
      <Dialog
        visible={Boolean(actions.userToDelete)}
        onClose={actions.confirmBusy ? undefined : () => actions.setUserToDelete(null)}
        title={t('deleteUserConfirmTitle')}
        subtitle={t('deleteUserConfirmBody').replace('{name}', actions.userToDelete?.fullName || '')}
        icon={trash}
        tone="danger"
      >
        <DialogActions>
          <Button
            title={t('delete')}
            variant="destructive"
            onPress={actions.confirmDeleteUser}
            loading={actions.confirmBusy}
          />
          <Button
            title={t('cancel')}
            variant="outline"
            onPress={() => actions.setUserToDelete(null)}
            disabled={actions.confirmBusy}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        visible={Boolean(actions.providerToRefuse)}
        onClose={actions.confirmBusy ? undefined : () => actions.setProviderToRefuse(null)}
        title={t('refuseArtisanTitle')}
        subtitle={t('refuseArtisanBody').replace('{name}', actions.providerToRefuse?.user.fullName || '')}
        icon={<ShieldX size={22} color={colors.dangerText} />}
        tone="danger"
      >
        <DialogActions>
          <Button
            title={t('refuseArtisan')}
            variant="destructive"
            onPress={() => actions.providerToRefuse && void actions.decideProvider(actions.providerToRefuse, false)}
            loading={actions.confirmBusy}
          />
          <Button
            title={t('cancel')}
            variant="outline"
            onPress={() => actions.setProviderToRefuse(null)}
            disabled={actions.confirmBusy}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        visible={Boolean(actions.categoryToDelete)}
        onClose={actions.confirmBusy ? undefined : () => actions.setCategoryToDelete(null)}
        title={t('deleteCategoryConfirmTitle')}
        subtitle={t('deleteCategoryConfirmBody').replace('{name}', actions.categoryToDelete?.name || '')}
        icon={trash}
        tone="danger"
      >
        <DialogActions>
          <Button
            title={t('delete')}
            variant="destructive"
            onPress={actions.confirmDeleteCategory}
            loading={actions.confirmBusy}
          />
          <Button
            title={t('cancel')}
            variant="outline"
            onPress={() => actions.setCategoryToDelete(null)}
            disabled={actions.confirmBusy}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        visible={logoutOpen}
        onClose={onCloseLogout}
        title={t('logoutConfirmTitle')}
        subtitle={t('logoutConfirmBody')}
        icon={<LogOut size={22} color={colors.dangerText} />}
        tone="danger"
      >
        <DialogActions>
          <Button
            title={t('logoutAdmin')}
            variant="destructive"
            onPress={() => {
              onCloseLogout();
              onLogout();
            }}
          />
          <Button title={t('cancel')} variant="outline" onPress={onCloseLogout} />
        </DialogActions>
      </Dialog>
    </>
  );
}
