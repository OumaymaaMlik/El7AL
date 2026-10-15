import React, { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AdminCard, Spinner } from './AdminUi';
import { CategoryFormModal, type CategoryDraft } from './CategoryFormModal';
import { renderCategoryIcon } from '../ui/categoryIcons';
import type { AdminCategory } from './adminTypes';
import { useAdminAction, useAdminData } from './useAdminData';

const ICON_BUTTON = 'p-1.5 text-slate-500 rounded-xl transition-colors';

export const CategoriesTab: React.FC = () => {
  const { data: categories, loading, reload } = useAdminData<AdminCategory[]>('/admin/categories', []);
  const act = useAdminAction();
  /** `undefined` = closed, `null` = creating, a category = editing it. */
  const [form, setForm] = useState<AdminCategory | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<AdminCategory | null>(null);

  const save = async (draft: CategoryDraft) => {
    const editing = form;
    const ok = await act(
      () => (editing ? api.put(`/admin/categories/${editing.id}`, draft) : api.post('/admin/categories', draft)),
      {
        title: editing ? 'Catégorie mise à jour' : 'Catégorie ajoutée',
        message: editing ? 'La catégorie a été modifiée.' : 'Nouvelle catégorie créée.',
      },
    );
    if (ok) {
      setForm(undefined);
      await reload();
    }
  };

  const remove = async (category: AdminCategory) => {
    const ok = await act(() => api.delete(`/admin/categories/${category.id}`), {
      title: 'Catégorie supprimée',
      message: 'La catégorie a été supprimée.',
    });
    if (ok) {
      setToDelete(null);
      await reload();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Gestion des services et catégories</h3>
          <p className="text-xs text-slate-500">
            Les spécialités disponibles pour les prestataires et les demandes clients.
          </p>
        </div>
        <button
          onClick={() => setForm(null)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une catégorie</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <AdminCard
            key={c.id}
            className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                {renderCategoryIcon(c.icon, 'w-6 h-6')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{c.description || 'Aucune description'}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {c._count?.providers ?? 0} prestataires
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm(c)}
                  title="Modifier cette catégorie"
                  aria-label="Modifier cette catégorie"
                  className={`${ICON_BUTTON} hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setToDelete(c)}
                  title="Supprimer cette catégorie"
                  aria-label="Supprimer cette catégorie"
                  className={`${ICON_BUTTON} hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {form !== undefined && <CategoryFormModal category={form} onSubmit={save} onClose={() => setForm(undefined)} />}
      <ConfirmDialog
        isOpen={!!toDelete}
        title="Supprimer la catégorie ?"
        message={`Voulez-vous supprimer la catégorie ${toDelete?.name ?? ''} ?`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        tone="danger"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};
