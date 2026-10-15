import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, User as UserIcon } from 'lucide-react';
import { MobileTabBar } from '../components/ui/MobileTabBar';
import { AppHeader } from '../components/ui/AppHeader';
import { PixelBackground } from '../components/ui/PixelBackground';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../hooks/useTranslation';
import { ProviderOfferListener } from '../components/provider/ProviderOfferListener';
import { ProviderReviewReceivedModal } from '../components/provider/ProviderReviewReceivedModal';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProviderPresence } from '../hooks/useProviderPresence';

export const ProviderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  useProviderPresence();
  const navigate = useNavigate();
  const openReview = useNotificationStore((s) => s.openReview);
  const showReview = useNotificationStore((s) => s.showReview);

  return (
    <div className="relative min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <PixelBackground />
      <ProviderOfferListener />
      <ProviderReviewReceivedModal review={openReview} onClose={() => showReview(null)} />
      <AppHeader
        homeTo="/provider/home"
        spaceLabel={t.providerSpace}
        nav={[
          { to: '/provider/home', label: t.home },
          { to: '/provider/tracking', label: t.liveMissions },
        ]}
        user={user}
        profileTo="/provider/profile"
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
            { to: '/provider/home', label: t.home, icon: <Home /> },
            { to: '/provider/tracking', label: t.liveMissions, icon: <MapPin /> },
            { to: '/provider/profile', label: t.profile, icon: <UserIcon /> },
          ]}
        />
      )}

      <footer className="relative z-10 hidden md:block border-t border-light-border dark:border-dark-border py-7 text-sm text-slate-600 dark:text-slate-400">
        <p className="max-w-[1200px] mx-auto px-6">&copy; 2026 El 7al. {t.rightsReserved}</p>
      </footer>
    </div>
  );
};
