import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface TabItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * The phone navigation: a bar fixed to the bottom of the screen (the thumb's reach), hidden from
 * tablet width up where the header navigation takes over.
 */
export const MobileTabBar: React.FC<{ items: TabItem[]; label: string }> = ({ items, label }) => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={label}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] px-2 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                  active ? 'text-brand-500 dark:text-brand-bright' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className={`[&>svg]:w-5 [&>svg]:h-5 ${active ? 'text-brand-500 dark:text-brand-bright' : ''}`}>
                  {item.icon}
                </span>
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
