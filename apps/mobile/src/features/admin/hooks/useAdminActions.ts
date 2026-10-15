import { useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { useNotificationStore } from '../../notifications';
import {
  approveTopup,
  createCategory,
  deleteCategory,
  deleteUser,
  rejectTopup,
  resolveDispute,
  updateCategory,
  updateUserStatus,
  verifyProvider,
} from '../api/admin.api';
import type { AdminCategory, AdminUser, PendingProvider } from '../schemas/admin.schema';

export interface CategoryDraft {
  name: string;
  icon: string;
  description: string;
}

/** The admin's mutations (artisan checks, users, categories, top-ups, disputes) with their confirmations and toasts. */
export function useAdminActions(reload: () => void) {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [providerToRefuse, setProviderToRefuse] = useState<PendingProvider | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  /** `undefined` = closed, `null` = creating a category, a category = editing it. */
  const [categoryForm, setCategoryForm] = useState<AdminCategory | null | undefined>(undefined);
  const [categorySaving, setCategorySaving] = useState(false);

  const success = (title: string) => flashToast({ title, tone: 'success' });
  const failure = (e: unknown, fallback: string) =>
    flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, fallback), tone: 'error' });

  const decideProvider = async (provider: PendingProvider, approve: boolean) => {
    setConfirmBusy(true);
    try {
      await verifyProvider(provider.id, approve);
      if (approve) success(t('providerVerified'));
      else flashToast({ title: t('providerBlocked') });
      setProviderToRefuse(null);
      reload();
    } catch (e) {
      setProviderToRefuse(null);
      failure(e, t('errActionFailed'));
    } finally {
      setConfirmBusy(false);
    }
  };

  const setStatus = async (userId: string, status: string) => {
    try {
      await updateUserStatus(userId, status);
      success(t('statusUpdated'));
      reload();
    } catch (e) {
      failure(e, t('errActionFailed'));
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setConfirmBusy(true);
    try {
      await deleteUser(userToDelete.id);
      success(t('userDeleted'));
      setUserToDelete(null);
      reload();
    } catch (e) {
      setUserToDelete(null);
      failure(e, t('errDeleteUser'));
    } finally {
      setConfirmBusy(false);
    }
  };

  const saveCategory = async (draft: CategoryDraft) => {
    const editing = categoryForm;
    setCategorySaving(true);
    const input = { name: draft.name.trim(), icon: draft.icon, description: draft.description.trim() || undefined };
    try {
      if (editing) await updateCategory(editing.id, input);
      else await createCategory(input);
      success(t(editing ? 'categoryUpdatedToast' : 'categoryCreated'));
      setCategoryForm(undefined);
      reload();
    } catch (e) {
      failure(e, t('errCategoryCreate'));
    } finally {
      setCategorySaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setConfirmBusy(true);
    try {
      await deleteCategory(categoryToDelete.id);
      success(t('categoryDeleted'));
      setCategoryToDelete(null);
      reload();
    } catch {
      setCategoryToDelete(null);
      flashToast({ title: t('errorTitle'), message: t('errCategoryDelete'), tone: 'error' });
    } finally {
      setConfirmBusy(false);
    }
  };

  const approve = async (topupId: string) => {
    try {
      await approveTopup(topupId);
      success(t('topupApproved'));
      reload();
    } catch (e) {
      failure(e, t('errActionFailed'));
    }
  };

  const reject = async (topupId: string) => {
    try {
      await rejectTopup(topupId);
      flashToast({ title: t('topupRejected') });
      reload();
    } catch (e) {
      failure(e, t('errActionFailed'));
    }
  };

  const closeDispute = async (disputeId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await resolveDispute(disputeId, status);
      success(t(status === 'RESOLVED' ? 'disputeResolved' : 'disputeDismissed'));
      reload();
    } catch (e) {
      failure(e, t('errActionFailed'));
    }
  };

  return {
    decideProvider,
    providerToRefuse,
    setProviderToRefuse,
    setStatus,
    approve,
    reject,
    closeDispute,
    userToDelete,
    setUserToDelete,
    confirmDeleteUser,
    categoryToDelete,
    setCategoryToDelete,
    confirmDeleteCategory,
    confirmBusy,
    categoryForm,
    setCategoryForm,
    categorySaving,
    saveCategory,
  };
}

export type AdminActions = ReturnType<typeof useAdminActions>;
