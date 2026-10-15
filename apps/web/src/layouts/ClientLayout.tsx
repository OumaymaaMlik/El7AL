import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Home, User as UserIcon } from 'lucide-react';
import { MobileTabBar } from '../components/ui/MobileTabBar';
import { AppHeader } from '../components/ui/AppHeader';
import { PixelBackground } from '../components/ui/PixelBackground';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <PixelBackground />
      <AppHeader
        homeTo="/client/home"
        spaceLabel={t.clientSpace}
        nav={[
          { to: '/client/home', label: t.home },
          { to: '/client/tracking', label: t.tracking },
        ]}
        user={user}
        profileTo="/client/profile"
        onLogout={() => {
          logout();
          navigate('/login');
        }}
      />

      <main className="relative z-10 flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-28 md:pb-12">
        {children}
      </main>

      {user && (
        <MobileTabBar
          label="Navigation principale"
          items={[
            { to: '/client/home', label: t.home, icon: <Home /> },
            { to: '/client/tracking', label: t.tracking, icon: <Clock /> },
            { to: '/client/profile', label: t.profile, icon: <UserIcon /> },
          ]}
        />
      )}

      <footer className="relative z-10 hidden md:block border-t border-light-border dark:border-dark-border py-7 text-sm text-slate-600 dark:text-slate-400">
        <p className="max-w-[1200px] mx-auto px-6">&copy; 2026 El 7al. {t.rightsReserved}</p>
      </footer>
    </div>
  );
};
