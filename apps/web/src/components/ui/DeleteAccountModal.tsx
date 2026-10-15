import React, { useState } from 'react';
import { Lock, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { api, apiErrorMessage } from '../../services/api';
import { useLanguageStore, type Language } from '../../store/useLanguageStore';

const COPY: Record<Language, Record<'title' | 'warning' | 'password' | 'cancel' | 'confirm' | 'error', string>> = {
  fr: {
    title: 'Supprimer mon compte',
    warning:
      'Votre nom, téléphone, e-mail, photo, adresse et pièces d’identité seront effacés. Cette action est définitive. Elle est refusée tant qu’une demande ou une intervention est en cours.',
    password: 'Votre mot de passe',
    cancel: 'Annuler',
    confirm: 'Supprimer définitivement',
    error: 'La suppression a échoué. Réessayez.',
  },
  en: {
    title: 'Delete my account',
    warning:
      'Your name, phone, e-mail, photo, address and identity documents will be erased. This cannot be undone. It is refused while a request or job is open.',
    password: 'Your password',
    cancel: 'Cancel',
    confirm: 'Delete permanently',
    error: 'Deletion failed. Please try again.',
  },
  ar: {
    title: 'حذف حسابي',
    warning:
      'سيتم محو اسمك ورقم هاتفك وبريدك وصورتك وعنوانك ووثائق هويتك. لا يمكن التراجع عن ذلك. يُرفض الحذف ما دام هناك طلب أو تدخل جارٍ.',
    password: 'كلمة المرور',
    cancel: 'إلغاء',
    confirm: 'حذف نهائي',
    error: 'فشل الحذف. حاول مرة أخرى.',
  },
};

/** Asks for the password, then erases the account on the server and signs out. Required by the app stores. */
export const DeleteAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onDeleted: () => void }> = ({
  isOpen,
  onClose,
  onDeleted,
}) => {
  const language = useLanguageStore((s) => s.language);
  const c = COPY[language];
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.delete('/users/me', { data: { password } });
      onDeleted();
    } catch (err) {
      setError(apiErrorMessage(err, c.error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title={c.title} maxWidth="md">
      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{c.warning}</p>
        <Input
          label={c.password}
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4 text-slate-500" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={close} disabled={loading}>
            {c.cancel}
          </Button>
          <Button
            type="submit"
            variant="danger"
            className="flex-1"
            isLoading={loading}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {c.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/** The quiet "Delete my account" link at the bottom of a profile page, with its window. */
export const DeleteAccountButton: React.FC<{ onDeleted: () => void }> = ({ onDeleted }) => {
  const language = useLanguageStore((s) => s.language);
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-2 text-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline"
      >
        {COPY[language].title}
      </button>
      <DeleteAccountModal isOpen={open} onClose={() => setOpen(false)} onDeleted={onDeleted} />
    </div>
  );
};
