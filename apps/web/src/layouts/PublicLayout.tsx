import React from 'react';
import { Link } from 'react-router-dom';
import { SiteHeader } from '../components/ui/SiteHeader';
import { PixelBackground } from '../components/ui/PixelBackground';
import { Logo } from '../components/ui/Logo';
import { PRIVACY_POLICY } from '@el7al/shared';
import { useSiteCopy } from '../lib/siteCopy';
import { useLanguageStore } from '../store/useLanguageStore';

/** Header, page and footer of the public site (home, how it works, FAQ, contact). */
export const PublicLayout: React.FC<{ children: React.ReactNode; footer?: boolean }> = ({
  children,
  footer = true,
}) => {
  const c = useSiteCopy();
  const language = useLanguageStore((s) => s.language);
  const link = 'block py-1.5 font-semibold hover:underline';

  return (
    <div className="relative min-h-screen bg-light-bg dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      <PixelBackground />
      <SiteHeader />
      <main className="relative z-10">{children}</main>
      {footer && (
        <footer className="relative z-10 mt-14 sm:mt-24 bg-light-tile dark:bg-dark-card pt-10 sm:pt-16 pb-7">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
              <div className="col-span-2 md:col-span-1">
                <Link to="/" aria-label="El 7al">
                  <Logo />
                </Link>
                <p className="mt-3.5 max-w-[32ch] text-slate-600 dark:text-slate-300">{c.footer.tagline}</p>
              </div>
              <div>
                <h4 className="micro mb-3 font-sans">{c.footer.product}</h4>
                <Link className={link} to="/how-it-works">
                  {c.nav.how}
                </Link>
                <Link className={link} to="/faq">
                  {c.nav.faq}
                </Link>
              </div>
              <div>
                <h4 className="micro mb-3 font-sans">{c.footer.artisans}</h4>
                <Link className={link} to="/register?role=PROVIDER">
                  {c.nav.becomePro}
                </Link>
                <Link className={link} to="/login">
                  {c.nav.login}
                </Link>
              </div>
              <div>
                <h4 className="micro mb-3 font-sans">{c.footer.help}</h4>
                <Link className={link} to="/register?role=CLIENT">
                  {c.footer.signUp}
                </Link>
                <Link className={link} to="/contact">
                  {c.nav.contact}
                </Link>
                <Link className={link} to="/privacy">
                  {PRIVACY_POLICY[language].title}
                </Link>
              </div>
            </div>
            <p className="mt-9 pt-5 border-t border-light-border dark:border-dark-border text-[13px] text-slate-600 dark:text-slate-400">
              &copy; 2026 El 7al. {c.footer.rights}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
