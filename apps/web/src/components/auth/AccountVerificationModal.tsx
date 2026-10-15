import React, { useState } from 'react';
import { Mail, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';

interface AccountVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  fullName?: string;
  /** Called once the code is verified; resolves to an error message, or null when it worked. */
  onVerified: () => Promise<string | null>;
}

export const AccountVerificationModal: React.FC<AccountVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  fullName,
  onVerified,
}) => {
  const [targetEmail, setTargetEmail] = useState(email);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  React.useEffect(() => {
    if (email) setTargetEmail(email);
  }, [email]);

  const { addNotification } = useNotificationStore();

  const handleVerify = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (code.length < 6) {
      addNotification({
        title: 'Code invalide',
        message: 'Veuillez saisir le code de vérification à 6 chiffres.',
        type: 'danger',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/email/verify', { email: (targetEmail || email || '').trim(), code: code.trim() });
    } catch (err) {
      addNotification({
        title: 'Vérification échouée',
        message: apiErrorMessage(err, 'Code de vérification invalide ou expiré.'),
        type: 'danger',
      });
      setIsLoading(false);
      return;
    }

    const failure = await onVerified();
    setIsLoading(false);
    if (failure) {
      addNotification({ title: 'Inscription impossible', message: failure, type: 'danger' });
      return;
    }
    addNotification({
      title: 'Compte créé',
      message: 'Votre adresse e-mail est confirmée. Bienvenue sur El 7al !',
      type: 'success',
    });
    onClose();
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const res = await api.post('/auth/email/send-verification', {
        email: (targetEmail || email || '').trim(),
        fullName,
      });

      if (res.data.success) {
        addNotification({
          title: 'Code Renvoyé ! 📧',
          message: `Un nouveau code a été envoyé à ${targetEmail || email}.`,
          type: 'info',
        });
      }
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: 'Impossible de renvoyer le code pour le moment.',
        type: 'danger',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <form onSubmit={handleVerify} className="space-y-6 text-center py-2">
        <div className="w-16 h-16 rounded-tile bg-brand-500/10 text-brand-500 dark:text-brand-accent flex items-center justify-center mx-auto ">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-accent font-extrabold text-xs">
            Vérification E-mail Requis
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">Validez votre Compte El 7al</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Code de vérification envoyé à :<br />
            <strong className="text-slate-900 dark:text-white font-mono">
              {targetEmail || email || 'votre compte'}
            </strong>
          </p>
        </div>

        {/* 6-Digit Code Input */}
        <div className="space-y-2">
          <div className="relative max-w-xs mx-auto">
            <KeyRound className="w-5 h-5 text-slate-500 dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              aria-label="123456"
              placeholder="123456"
              className="w-full ps-11 pe-4 py-3 rounded-2xl border-2 border-brand-500/40 dark:border-brand-accent/40 bg-white dark:bg-slate-900 text-center font-mono font-black text-2xl tracking-[0.5em] text-slate-900 dark:text-white outline-none focus:border-brand-500 dark:focus:border-brand-bright"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consultez votre boîte de réception ou dossier Spams.
          </p>
        </div>

        {/* Resend Link */}
        <div className="text-xs">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="font-bold text-brand-500 dark:text-brand-accent hover:underline flex items-center gap-1 mx-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Renvoyer un nouveau code</span>
          </button>
        </div>

        {/* Verify Button */}
        <div className="pt-2">
          <Button
            type="submit"
            onClick={handleVerify}
            variant="primary"
            isLoading={isLoading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            className="w-full py-3.5 bg-brand-500 hover:bg-white/10 text-white font-black uppercase"
          >
            CONFIRMER ET CRÉER MON COMPTE
          </Button>
        </div>
      </form>
    </Modal>
  );
};
