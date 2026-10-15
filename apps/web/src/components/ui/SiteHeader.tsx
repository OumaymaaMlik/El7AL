import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { useAuthStore } from '../../store/useAuthStore';
import { useSiteCopy } from '../../lib/siteCopy';

const SPACE: Record<string, string> = { CLIENT: '/client/home', PROVIDER: '/provider/home', ADMIN: '/dashboard_admin' };

/**
 * The header of every public page (home, how it works, FAQ, contact, login, register): same links, same
 * buttons. Only what makes no sense on the current page is left out: no "Log in" on the login page, no
 * "Become a pro" on the register page, and for someone already signed in a "My space" button replaces both.
 */
export const SiteHeader: React.FC = () => {
  const c = useSiteCopy();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const actions =
    user && token
      ? [{ to: SPACE[user.role] ?? '/', label: c.nav.mySpace, primary: true }]
      : [
          ...(pathname === '/login' ? [] : [{ to: '/login', label: c.nav.login }]),
          ...(pathname === '/register'
            ? []
            : [{ to: '/register?role=PROVIDER', label: c.nav.becomePro, primary: true }]),
        ];

  return (
    <AppHeader
      homeTo="/"
      menuLabel={c.nav.menu}
      publicNav={[
        { to: '/', label: c.nav.home },
        { to: '/how-it-works', label: c.nav.how },
        { to: '/faq', label: c.nav.faq },
        { to: '/contact', label: c.nav.contact },
      ]}
      publicActions={actions}
    />
  );
};
