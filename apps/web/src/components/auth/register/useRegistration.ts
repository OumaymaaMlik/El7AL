import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiErrorMessage } from '../../../services/api';
import { useAuthStore, type UserRole } from '../../../store/useAuthStore';
import { EMPTY_FORM, type RegisterCategory, type RegisterForm } from './registerOptions';
import { useCinUpload } from './useCinUpload';

const PROVIDER_LAST_STEP = 4;
const CLIENT_LAST_STEP = 2;

/**
 * Everything the registration page does besides drawing: the form values, the artisan steps and their rules,
 * the identity upload, the e-mail code request, and the final account creation.
 */
export function useRegistration(initialRole: UserRole) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<RegisterCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const cin = useCinUpload(setError);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) setCategories(res.data.data);
      })
      .catch(() => setError('Impossible de charger les spécialités. Rechargez la page.'));
  }, []);

  const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 8);

  const toggleCategory = (id: string) =>
    setField(
      'selectedCategories',
      form.selectedCategories.includes(id)
        ? form.selectedCategories.filter((c) => c !== id)
        : [...form.selectedCategories, id],
    );

  /** The rule of one step; returns the message to show, or null when the step is fine. */
  const problemWith = (s: number): string | null => {
    if (s === 1) {
      if (!form.fullName.trim()) return 'Veuillez saisir votre nom et prénom.';
      if (!form.email.trim() || !form.email.includes('@')) return 'Veuillez saisir une adresse e-mail valide.';
      if (form.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (s === 2 && form.phoneDigits.length !== 8) return 'Le numéro de téléphone doit comporter exactement 8 chiffres.';
    if (s === 3 && form.selectedCategories.length === 0) return 'Veuillez sélectionner au moins une spécialité.';
    if (s === 4) {
      if (cin.uploading) return 'Le document est en cours de téléversement, patientez un instant.';
      if (!cin.url) return "Veuillez téléverser la photo de votre pièce d'identité (CIN) pour continuer.";
    }
    return null;
  };

  const check = (s: number) => {
    const problem = problemWith(s);
    setError(problem);
    return !problem;
  };

  const next = () => {
    if (check(step)) setStep((s) => Math.min(s + 1, PROVIDER_LAST_STEP));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  /** From the step bar: going back is free, going forward needs every step before it to be valid. */
  const goTo = (target: number) => {
    for (let s = step; s < target; s++) if (!check(s)) return;
    setError(null);
    setStep(target);
  };

  const changeRole = (value: UserRole) => {
    setRole(value);
    setStep(1);
    setError(null);
  };

  const payload = () => {
    const common = {
      fullName: form.fullName.trim(),
      phoneNumber: `+216${form.phoneDigits}`,
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };
    if (role !== 'PROVIDER') return { ...common, defaultAddress: form.defaultAddress.trim() || undefined };
    return {
      ...common,
      bio: form.bio.trim() || `Technicien spécialisé (${form.governorate}) - Expérience: ${form.experience}`,
      radiusKm: parseFloat(form.radiusKm) || 15,
      categoryIds: form.selectedCategories,
      documentsUrl: cin.url ? [cin.url] : [],
      ...(form.cinNumber.length === 8 ? { cinNumber: form.cinNumber } : {}),
    };
  };

  /** Validates the whole form, then e-mails a verification code and opens the code window. */
  const submit = async () => {
    const last = role === 'PROVIDER' ? PROVIDER_LAST_STEP : CLIENT_LAST_STEP;
    for (let s = 1; s <= last; s++) {
      if (!check(s)) {
        if (role === 'PROVIDER') setStep(s);
        return;
      }
    }
    setLoading(true);
    try {
      await api.post('/auth/email/send-verification', {
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
      });
      setVerifying(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Impossible d'envoyer le code de vérification. Veuillez réessayer."));
    } finally {
      setLoading(false);
    }
  };

  /** After the code is verified: create the account and sign in. Returns an error message, or null. */
  const complete = async (): Promise<string | null> => {
    try {
      const res = await api.post(role === 'PROVIDER' ? '/auth/register/provider' : '/auth/register/client', payload());
      if (!res.data.success || !res.data.token || !res.data.user) return 'Création du compte impossible.';
      setAuth(res.data.user, res.data.token, res.data.refreshToken);
      navigate(role === 'PROVIDER' ? '/provider/home' : '/client/home');
      return null;
    } catch (err) {
      return apiErrorMessage(err, 'Erreur lors de la création de votre compte. Veuillez vérifier vos informations.');
    }
  };

  return {
    role,
    changeRole,
    step,
    form,
    setField,
    digitsOnly,
    categories,
    toggleCategory,
    error,
    loading,
    cin,
    next,
    back,
    goTo,
    submit,
    complete,
    verifying,
    closeVerification: () => setVerifying(false),
  };
}
