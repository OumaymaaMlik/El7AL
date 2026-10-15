import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ICON_GALLERY } from '../ui/categoryIcons';
import type { AdminCategory } from './adminTypes';

export interface CategoryDraft {
  name: string;
  icon: string;
  description: string;
}

const FIELD =
  'w-full bg-light-bg dark:bg-dark-bg border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-3 text-xs font-medium text-slate-900 dark:text-white';
const LABEL = 'block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1';

/** One form for creating and for editing a category (name, description, icon). */
export const CategoryFormModal: React.FC<{
  category: AdminCategory | null;
  onSubmit: (draft: CategoryDraft) => void;
  onClose: () => void;
}> = ({ category, onSubmit, onClose }) => {
  const [draft, setDraft] = useState<CategoryDraft>({
    name: category?.name ?? '',
    icon: category?.icon ?? 'Wrench',
    description: category?.description ?? '',
  });

  return (
    <Modal isOpen onClose={onClose} title={category ? 'Modifier la catégorie' : 'Ajouter une catégorie'} maxWidth="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(draft);
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className={LABEL}>Nom de la catégorie</label>
          <input
            required
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Description</label>
          <input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            className={FIELD}
          />
        </div>

        <div>
          <span className={`${LABEL} mb-2`}>Choisir une icône</span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-light-bg dark:bg-dark-bg rounded-2xl border border-slate-200 dark:border-slate-800">
            {ICON_GALLERY.map(({ name, label, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setDraft({ ...draft, icon: name })}
                className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  draft.icon === name
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold truncate max-w-full">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
          >
            {category ? 'Enregistrer' : 'Créer la catégorie'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
