import React, { useState } from 'react';
import { api } from '../../services/api';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AdminCard } from './AdminUi';
import { useAdminAction, useAdminData } from './useAdminData';

interface BankAccount {
  rib: string | null;
}

const RibForm: React.FC<{ current: string; onSave: (rib: string) => Promise<void>; onClose: () => void }> = ({
  current,
  onSave,
  onClose,
}) => {
  const [rib, setRib] = useState(current);
  const [saving, setSaving] = useState(false);
  return (
    <Modal isOpen onClose={onClose} title="Modifier le RIB" maxWidth="md">
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await onSave(rib);
          setSaving(false);
        }}
      >
        <label className="block">
          <span className="block text-sm font-bold mb-1">Nouveau RIB ou IBAN</span>
          <input
            required
            autoFocus
            maxLength={50}
            value={rib}
            onChange={(e) => setRib(e.target.value)}
            className="w-full bg-light-bg dark:bg-dark-bg border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 font-semibold"
          />
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          20 chiffres, ou TN suivi de 22 chiffres. Les artisans verront ce compte tout de suite : vérifiez chaque
          chiffre.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={saving} disabled={!rib.trim()}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/** The bank account artisans transfer to, with the button that changes it. */
export const RibCard: React.FC = () => {
  const { data, reload } = useAdminData<BankAccount>('/admin/rib', { rib: null });
  const act = useAdminAction();
  const [editing, setEditing] = useState(false);

  const save = async (rib: string) => {
    const ok = await act(() => api.put('/admin/rib', { rib }), {
      title: 'RIB enregistré',
      message: 'Les artisans voient maintenant ce compte.',
    });
    if (ok) {
      setEditing(false);
      await reload();
    }
  };

  return (
    <AdminCard className="p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          Compte bancaire El 7al (RIB)
        </span>
        <span className="block mt-1 font-bold break-words select-all">
          {data.rib ?? 'Aucun compte : les artisans ne voient pas de RIB.'}
        </span>
      </div>
      <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
        Modifier le RIB
      </Button>
      {editing && <RibForm current={data.rib ?? ''} onSave={save} onClose={() => setEditing(false)} />}
    </AdminCard>
  );
};
