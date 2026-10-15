import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PixelBackground } from '../components/ui/PixelBackground';
import { SiteHeader } from '../components/ui/SiteHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthSidePanel } from '../components/auth/AuthSidePanel';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { authCopy } from '../lib/authCopy';
import { api, apiErrorMessage } from '../services/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const language = useLanguageStore((s) => s.language);
  const c = authCopy[language] ?? authCopy.fr;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg(c.fillAll);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/auth/login', { identifier: identifier.trim(), password });

      if (response.data.success) {
        const user = response.data.user || response.data.data?.user;
        const token = response.data.token || response.data.data?.token;

        if (user && token) {
          setAuth(user, token, response.data.refreshToken);

          if (user.role === 'ADMIN') {
            navigate('/dashboard_admin');
          } else if (user.role === 'PROVIDER') {
            navigate('/provider/home');
          } else {
            navigate('/client/home');
          }
        }
      }
    } catch (err) {
      setErrorMsg(apiErrorMessage(err, c.failed));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <PixelBackground />
      <SiteHeader />

      <main className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 lg:min-h-[calc(100vh-72px)]">
        <AuthSidePanel title={c.sideTitle} text={c.sideText} />

        <div className="flex items-center justify-center py-8 lg:px-12">
          <form onSubmit={handleSubmit} noValidate className="w-full max-w-[420px] flex flex-col gap-5">
            <Link
              to="/"
              className="self-start inline-flex items-center gap-2 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 rtl:-scale-x-100" aria-hidden="true" />
              {c.back}
            </Link>

            <div>
              <h1 className="text-[clamp(34px,4vw,48px)] font-bold leading-[1.05] tracking-[-0.03em] rtl:tracking-normal">
                {c.title}
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{c.sub}</p>
            </div>

            <Input
              label={c.email}
              type="email"
              autoComplete="username"
              placeholder={c.emailPh}
              icon={<Mail className="w-5 h-5" />}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />

            <div className="relative">
              <Input
                label={c.password}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={c.passwordPh}
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pe-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? c.hide : c.show}
                className="absolute end-1 bottom-1 w-[44px] h-[44px] grid place-items-center rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errorMsg && (
              <div role="alert" className="flex items-start gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-sm font-bold text-brand-500 dark:text-brand-accent underline underline-offset-[3px]"
              >
                {c.forgot}
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5 rtl:-scale-x-100" />}
            >
              {c.submit}
            </Button>

            <p className="text-slate-600 dark:text-slate-300">
              {c.noAccount}{' '}
              <Link
                to="/register"
                className="font-bold text-brand-500 dark:text-brand-accent underline underline-offset-[3px]"
              >
                {c.create}
              </Link>
            </p>
          </form>
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={identifier}
      />
    </div>
  );
};
