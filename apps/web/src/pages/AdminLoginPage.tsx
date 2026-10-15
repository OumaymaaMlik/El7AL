import React, { useState } from 'react';
import { Logo } from '../components/ui/Logo';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api, apiErrorMessage } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('admin@el7al.com');
  const [password, setPassword] = useState('adminel7al@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        identifier: email.trim(),
        password: password.trim(),
      });

      const { user, token } = response.data;

      if (user.role !== 'ADMIN') {
        setError("Accès refusé : Ce compte n'est pas un compte Administrateur.");
        setLoading(false);
        return;
      }

      setAuth(user, token, response.data.refreshToken);
      // Auto-redirect Admin to /dashboard_admin
      navigate('/dashboard_admin');
    } catch (err) {
      setError(apiErrorMessage(err, 'Identifiants incorrects. Veuillez réessayer.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 sm:p-6 text-slate-100 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute -top-40 -start-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between z-10 max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div>
            <h1>
              <Logo tone="onDark" className="text-4xl" />
            </h1>
            <span className="block text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Portail Administration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Login Card Area */}
      <main className="flex-1 flex items-center justify-center z-10 py-10">
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 p-8 rounded-tile ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Espace Supervision Sécurisé
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Connexion Admin</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Connectez-vous pour accéder au tableau de bord d'administration El 7al
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 flex items-start gap-3 text-rose-300 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Adresse Email Admin
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="admin@el7al.com"
                  placeholder="admin@el7al.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 ps-11 pe-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="••••••••••••"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 ps-11 pe-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se Connecter au Portail Admin</span>
                  <ArrowRight className="rtl:-scale-x-100 w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 z-10">
        © 2026 Solution El 7al — Plateforme Sécurisée d'Administration & Supervision Flotte.
      </footer>
    </div>
  );
};
