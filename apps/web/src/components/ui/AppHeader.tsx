import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { SettingsMenu } from './SettingsMenu';
import { NotificationBell } from '../notifications/NotificationCenter';

export interface HeaderNavItem {
  to: string;
  label: string;
}

interface AppHeaderProps {
  homeTo: string;
  /** Small label under the logo ("Espace client"). */
  spaceLabel?: string;
  /** Links of the signed-in area (hidden on phones: the bottom tab bar takes over). */
  nav?: HeaderNavItem[];
  /** Links of the public site: shown inline on desktop and in a drawer behind a menu button on phones. */
  publicNav?: HeaderNavItem[];
  /** Calls to action of the public site (log in, become an artisan), also repeated in the drawer. */
  publicActions?: { to: string; label: string; primary?: boolean }[];
  user?: { fullName?: string; avatarUrl?: string | null } | null;
  profileTo?: string;
  onLogout?: () => void;
  menuLabel?: string;
}

const navLink = (isActive: boolean) =>
  `h-[42px] px-2.5 xl:px-3 inline-flex items-center rounded-full text-[15px] font-semibold whitespace-nowrap transition-colors ${
    isActive
      ? 'bg-light-tile dark:bg-dark-surface text-slate-900 dark:text-white'
      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
  }`;

const actionClass = (primary?: boolean) =>
  `h-10 px-4 whitespace-nowrap inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors ${
    primary
      ? 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover'
      : 'hover:bg-light-tile dark:hover:bg-dark-surface'
  }`;

/** The one header of the app: logo, pill navigation, language, theme, account; a drawer on phones. */
export const AppHeader: React.FC<AppHeaderProps> = ({
  homeTo,
  spaceLabel,
  nav = [],
  publicNav = [],
  publicActions = [],
  user,
  profileTo,
  onLogout,
  menuLabel = 'Menu',
}) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const hasDrawer = publicNav.length > 0 || publicActions.length > 0;
  // With links, the header is three columns so the links sit in the exact middle of the bar.
  const hasNav = nav.length > 0 || publicNav.length > 0;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
      <div
        className={`w-full px-4 sm:px-6 lg:px-8 min-h-[72px] py-2.5 flex flex-wrap items-center gap-x-3 lg:gap-x-4 ${hasNav ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]' : ''}`}
      >
        <Link to={homeTo} className="flex flex-col gap-1 shrink-0" aria-label="El 7al">
          <Logo />
          {spaceLabel && (
            <span className="ps-[50px] -mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em] rtl:tracking-normal rtl:text-xs text-slate-600 dark:text-slate-400">
              {spaceLabel}
            </span>
          )}
        </Link>

        {(nav.length > 0 || publicNav.length > 0) && (
          <nav aria-label="Navigation" className="hidden lg:flex gap-0.5 justify-self-center">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => navLink(isActive)}>
                {item.label}
              </NavLink>
            ))}
            {publicNav.map((item) => (
              <NavLink key={item.to} to={item.to} end className={({ isActive }) => navLink(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2 ms-auto lg:ms-0 lg:justify-self-end">
          {/* Visitors get the two buttons; signed-in users find them in the settings menu. */}
          {!user && (
            <>
              <LanguageToggle />
              <ThemeToggle />
            </>
          )}
          {publicActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className={`${actionClass(a.primary)} hidden ${a.primary ? 'min-[1340px]:inline-flex' : 'sm:inline-flex'}`}
            >
              {a.label}
            </Link>
          ))}
          {hasDrawer && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={menuLabel}
              aria-expanded={open}
              aria-controls="site-drawer"
              className="lg:hidden w-11 h-11 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card grid place-items-center hover:bg-light-tile dark:hover:bg-dark-surface"
            >
              {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          )}
          {user && (
            <>
              <NotificationBell />
              <Link
                to={profileTo || homeTo}
                className="hidden sm:flex items-center gap-2.5 h-11 ps-1.5 pe-4 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card font-semibold text-sm hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-brand-500 dark:bg-brand-accent text-white dark:text-brand-on-accent grid place-items-center font-display font-bold text-[13px] overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.fullName || '?').charAt(0).toUpperCase()
                  )}
                </span>
                <span className="max-w-[140px] truncate">{user.fullName}</span>
              </Link>
              <SettingsMenu onLogout={onLogout} />
            </>
          )}
        </div>

        {hasDrawer && open && (
          <div
            id="site-drawer"
            className="lg:hidden w-full order-last flex flex-col gap-0.5 pt-2 pb-3.5 mt-2 border-t border-light-border dark:border-dark-border"
          >
            {publicNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `h-12 px-2 flex items-center rounded-xl text-base font-semibold ${isActive ? 'bg-light-tile dark:bg-dark-surface' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              {publicActions.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className={`h-12 rounded-full inline-flex items-center justify-center font-bold ${
                    a.primary
                      ? 'bg-brand-500 text-white dark:bg-brand-accent dark:text-brand-on-accent'
                      : 'border-[1.5px] border-slate-900 dark:border-slate-100'
                  }`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
