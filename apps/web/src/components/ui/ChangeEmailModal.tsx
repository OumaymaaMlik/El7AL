import React, { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { api, apiErrorMessage } from '../../services/api';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  /** Called with the new address once the server has confirmed it. */
  onChanged: (email: string) => void;
}

/**
 * Two steps: type the new address (a code is sent to it), then type the code. The address of the account
 * changes only when the code is right, so nobody can attach an address they do not read.
 */
export const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose, currentEmail, onChanged }) => {
  const [step, setStep] = useState<'ADDRESS' | 'CODE'>('ADDRESS');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setStep('ADDRESS');
    setEmail('');
    setCode('');
    setError(null);
    onClose();
  };

  const run = async (work: () => Promise<void>, fallback: string) => {
    setLoading(true);
    setError(null);
    try {
      await work();
    } catch (err) {
      setError(apiErrorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await api.post('/users/email/request-change', { email: email.trim() });
      setStep('CODE');
    }, "Le code n'a pas pu être envoyé.");
  };

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const res = await api.post('/users/email/confirm-change', { email: email.trim(), code: code.trim() });
      onChanged(res.data.data?.email ?? email.trim().toLowerCase());
      close();
    }, 'Code invalide ou expiré.');
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Changer d'adresse e-mail" maxWidth="md">
      {step === 'ADDRESS' ? (
        <form onSubmit={sendCode} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Adresse actuelle : <strong>{currentEmail || 'aucune'}</strong>. Nous enverrons un code à la nouvelle adresse
            pour vérifier qu&apos;elle est bien à vous.
          </p>
          <Input
            label="Nouvelle adresse e-mail"
            type="email"
            placeholder="adresse@exemple.tn"
            icon={<Mail className="w-4 h-4 text-slate-500" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Envoyer le code
          </Button>
        </form>
      ) : (
        <form onSubmit={confirm} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Un code à 6 chiffres a été envoyé à <strong>{email.trim()}</strong>. Il est valable 10 minutes.
          </p>
          <Input
            label="Code de vérification"
            inputMode="numeric"
            placeholder="123456"
            icon={<ShieldCheck className="w-4 h-4 text-slate-500" />}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
          {error && (
            <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" isLoading={loading} disabled={code.length !== 6}>
            Confirmer la nouvelle adresse
          </Button>
          <button
            type="button"
            onClick={() => setStep('ADDRESS')}
            className="w-full text-xs font-semibold text-brand-500 dark:text-brand-accent"
          >
            Changer l&apos;adresse saisie
          </button>
        </form>
      )}
    </Modal>
  );
};
