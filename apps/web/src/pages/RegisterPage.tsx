import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { PixelBackground } from '../components/ui/PixelBackground';
import { SiteHeader } from '../components/ui/SiteHeader';
import { AuthSidePanel } from '../components/auth/AuthSidePanel';
import { AccountVerificationModal } from '../components/auth/AccountVerificationModal';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { ClientForm } from '../components/auth/register/ClientForm';
import { ProviderStepper } from '../components/auth/register/ProviderStepper';
import { DocumentStep, IdentityStep, SkillsStep, ZoneStep } from '../components/auth/register/ProviderSteps';
import { useRegistration } from '../components/auth/register/useRegistration';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reg = useRegistration(searchParams.get('role')?.toLowerCase() === 'provider' ? 'PROVIDER' : 'CLIENT');
  const { role, step, form, setField, digitsOnly } = reg;
  const isProvider = role === 'PROVIDER';
  const stepProps = { form, setField, digitsOnly };

  return (
    <div className="relative min-h-screen bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <PixelBackground />
      <SiteHeader />
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2">
        <AuthSidePanel
          title={isProvider ? 'Rejoignez les artisans El 7al.' : 'Votre compte client, en quelques secondes.'}
          text={
            isProvider
              ? 'Recevez des demandes près de vous, avec une commission fixe de 30 TND par mission terminée.'
              : 'Décrivez la panne, un artisan vérifié proche de vous répond en direct.'
          }
        />

        <div className="flex flex-col items-center py-8 lg:px-12">
          <div className="max-w-2xl w-full space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="rtl:-scale-x-100 w-4 h-4" />
              <span>Retour à l&apos;accueil</span>
            </Link>

            <div
              role="group"
              aria-label="Type de compte"
              className="grid grid-cols-2 gap-1 p-1 rounded-full bg-light-tile dark:bg-dark-surface"
            >
              {(
                [
                  ['CLIENT', 'Je suis client'],
                  ['PROVIDER', 'Je suis artisan'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={role === value}
                  onClick={() => reg.changeRole(value)}
                  className={`h-11 rounded-full text-sm font-bold transition-colors ${
                    role === value
                      ? 'bg-brand-500 text-white dark:bg-brand-accent dark:text-brand-on-accent'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <GlassCard className="p-6 md:p-10 space-y-6">
              <div className="space-y-3">
                <span className="micro">{isProvider ? 'Espace artisan' : 'Espace client'}</span>
                <h1 className="text-[clamp(30px,4vw,44px)] font-bold leading-[1.05] tracking-[-0.03em]">
                  {isProvider ? 'Créer votre compte artisan' : 'Créer votre compte client'}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 max-w-md">
                  {isProvider
                    ? "Rejoignez les professionnels qualifiés et recevez des demandes d'intervention d'urgence"
                    : "Commandez vos services d'urgence auprès d'artisans qualifiés"}
                </p>
              </div>

              {isProvider && <ProviderStepper current={step} onGoTo={reg.goTo} />}

              {reg.error && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{reg.error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isProvider && step < 4) reg.next();
                  else void reg.submit();
                }}
                className="space-y-5"
              >
                {!isProvider && <ClientForm {...stepProps} loading={reg.loading} />}
                {isProvider && step === 1 && <IdentityStep {...stepProps} />}
                {isProvider && step === 2 && <ZoneStep {...stepProps} />}
                {isProvider && step === 3 && (
                  <SkillsStep {...stepProps} categories={reg.categories} onToggleCategory={reg.toggleCategory} />
                )}
                {isProvider && step === 4 && <DocumentStep cin={reg.cin} />}

                {isProvider && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {step > 1 && (
                      <Button type="button" variant="secondary" onClick={reg.back} className="flex-1">
                        <ArrowLeft className="rtl:-scale-x-100 w-4 h-4 me-1.5" />
                        Précédent
                      </Button>
                    )}
                    {step < 4 ? (
                      <Button type="button" variant="primary" onClick={reg.next} className="flex-1 font-bold">
                        Suivant
                        <ArrowRight className="rtl:-scale-x-100 w-4 h-4 ms-1.5" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => void reg.submit()}
                        className="flex-1 font-extrabold"
                        isLoading={reg.loading}
                      >
                        Créer mon compte artisan
                      </Button>
                    )}
                  </div>
                )}
              </form>

              <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                Vous avez déjà un compte ?{' '}
                <Link to="/login" className="font-bold text-brand-500 dark:text-brand-accent hover:underline">
                  Se connecter
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <AccountVerificationModal
        isOpen={reg.verifying}
        onClose={reg.closeVerification}
        email={form.email.trim().toLowerCase()}
        fullName={form.fullName.trim()}
        onVerified={reg.complete}
      />
    </div>
  );
};
