import React, { useState } from 'react';
import { KeyRound, Mail, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, initialEmail = '' }) => {
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addNotification } = useNotificationStore();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length < 3) {
      addNotification({
        title: 'Identifiant requis',
        message: 'Veuillez saisir votre e-mail ou votre numéro de téléphone.',
        type: 'danger',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/password/forgot', {
        identifier: email.trim(),
      });

      if (res.data.success) {
        addNotification({
          title: 'Code Envoyé ! 📧',
          message: "Si un compte correspond, un code de réinitialisation vient d'être envoyé par e-mail.",
          type: 'success',
        });
        setStep('RESET');
      }
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, "Impossible d'envoyer le code pour le moment."),
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      addNotification({
        title: 'Code Invalide',
        message: 'Veuillez saisir le code à 6 chiffres.',
        type: 'danger',
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      addNotification({
        title: 'Mot de passe court',
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
        type: 'danger',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addNotification({
        title: 'Mots de passe non identiques',
        message: 'La confirmation ne correspond pas au mot de passe.',
        type: 'danger',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/password/reset', {
        identifier: email.trim(),
        code: code.trim(),
        newPassword,
      });

      if (res.data.success) {
        addNotification({
          title: 'Mot de passe Réinitialisé ! 🎉',
          message: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
          type: 'success',
        });
        onClose();
        setStep('REQUEST');
        setCode('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addNotification({
        title: 'Réinitialisation Échouée',
        message: apiErrorMessage(err, 'Code invalide ou expiré.'),
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      {step === 'REQUEST' ? (
        <form onSubmit={handleRequestReset} className="space-y-6 text-center py-2">
          <div className="w-16 h-16 rounded-tile bg-brand-500/10 text-brand-500 dark:text-brand-accent flex items-center justify-center mx-auto ">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 dark:text-brand-accent font-extrabold text-xs">
              Récupération de Compte
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">Mot de Passe Oublié ?</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Saisissez votre e-mail ou votre numéro de téléphone. Nous vous enverrons un code à 6 chiffres pour
              réinitialiser votre accès.
            </p>
          </div>

          <div className="text-start space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">E-mail ou téléphone</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="e-mail ou 22 123 456"
                placeholder="e-mail ou 22 123 456"
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<ArrowRight className="rtl:-scale-x-100 w-4 h-4" />}
              className="w-full py-3.5 bg-brand-500 hover:bg-white/10 text-white font-black uppercase"
            >
              ENVOYER LE CODE DE RÉINITIALISATION
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-tile bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold text-xs">
              Étape 2 sur 2 • Nouveau Mot de Passe
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">Réinitialiser votre Mot de Passe</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Code envoyé à : <strong className="text-slate-900 dark:text-white">{email}</strong>
            </p>
          </div>

          {/* 6-digit Code */}
          <div className="text-start space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Code à 6 chiffres reçu par e-mail
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              aria-label="123456"
              placeholder="123456"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center font-mono font-black text-lg tracking-[0.3em] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* New Password */}
          <div className="text-start space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Nouveau Mot de Passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-label="••••••••"
                placeholder="••••••••"
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="text-start space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Confirmer le Nouveau Mot de Passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="••••••••"
                placeholder="••••••••"
                className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="w-full py-3.5 bg-brand-500 hover:bg-white/10 text-white font-black uppercase"
            >
              ENREGISTRER LE NOUVEAU MOT DE PASSE
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
