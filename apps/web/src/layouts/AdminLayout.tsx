import React from 'react';
import { Logo } from '../components/ui/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 ">
        <Link to="/dashboard_admin" className="flex items-center gap-3">
          <div>
            <Logo className="text-4xl" />
            <span className="block text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              Portail Administration
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-light-bg dark:bg-dark-bg px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <span>{user?.fullName || 'Administrateur'}</span>
          </div>

          <LanguageToggle />
          <ThemeToggle />

          <button
            onClick={() => {
              logout();
              navigate('/admin');
            }}
            className="p-2 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
};
