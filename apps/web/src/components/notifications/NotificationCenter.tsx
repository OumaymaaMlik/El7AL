import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { AppNotification, useNotificationStore } from '../../store/useNotificationStore';
import { ChatRow, ItemRow, groupByDay } from './notificationRows';
import { useNotificationCopy } from '../../lib/notificationCopy';
import { useLanguageStore } from '../../store/useLanguageStore';

/** The notification centre: a bottom sheet on phones, a side panel from tablet width. */
export const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose: onClosed }) => {
  const c = useNotificationCopy();
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'ar' ? 'ar-TN-u-nu-latn' : language === 'en' ? 'en-GB' : 'fr-FR';
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const { markAsRead, markAllAsRead, clearNotifications, showReview } = useNotificationStore();
  const [confirming, setConfirming] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Slides in after the first paint and slides out before the parent removes it.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const closing = useRef<ReturnType<typeof setTimeout>>();
  const onClose = useCallback(() => {
    if (closing.current) return;
    setShown(false);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    closing.current = setTimeout(onClosed, reduce ? 0 : 280);
  }, [onClosed]);
  useEffect(() => () => closing.current && clearTimeout(closing.current), []);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sections = useMemo(
    () => groupByDay(notifications, c.today, c.yesterday, locale),
    [notifications, c.today, c.yesterday, locale],
  );

  const open = (ids: string[], url?: string) => {
    markAsRead(ids);
    onClose();
    if (url) navigate(url);
  };
  // A review opens its own window (rating and comment) instead of a page.
  const openItem = (n: AppNotification) => {
    if (n.kind === 'REVIEW' && n.review) {
      markAsRead(n.id);
      onClose();
      showReview(n.review);
    } else {
      open([n.id], n.actionUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-stretch md:justify-end">
      <div
        className={`absolute inset-0 bg-slate-950/55 transition-opacity duration-300 ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={c.title}
        className={`relative flex flex-col w-full md:w-[440px] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${shown ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:ltr:translate-x-full md:rtl:-translate-x-full'} max-h-[85vh] md:max-h-none md:h-full rounded-t-3xl md:rounded-none bg-light-bg dark:bg-dark-bg border-t md:border-t-0 md:border-s border-light-border dark:border-dark-border shadow-2xl`}
      >
        <div className="flex justify-center pt-2.5 md:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-light-border dark:bg-dark-border" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1">
          <div>
            <h2 className="text-[22px] font-extrabold tracking-tight">{c.title}</h2>
            {unreadCount > 0 && (
              <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                {c.unread(unreadCount)}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={c.close}
            className="w-11 h-11 grid place-items-center rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-light-tile dark:hover:bg-dark-surface"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-5 h-11 text-sm">
            <button
              type="button"
              onClick={markAllAsRead}
              className="h-11 font-bold text-brand-500 dark:text-brand-accent"
            >
              {c.markAll}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="h-11 font-semibold text-red-700 dark:text-red-400"
            >
              {c.clearAll}
            </button>
          </div>
        )}

        {confirming && (
          <div
            role="alertdialog"
            aria-label={c.clearConfirm}
            className="mx-5 mb-2 rounded-xl border border-red-600 bg-red-50 dark:bg-red-950/40 p-3 space-y-2"
          >
            <p className="text-sm font-semibold">{c.clearConfirm}</p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 h-10 rounded-lg bg-white dark:bg-dark-card text-[13px] font-semibold"
              >
                {c.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearNotifications();
                  setConfirming(false);
                }}
                className="flex-1 h-10 rounded-lg bg-red-700 text-white text-[13px] font-bold"
              >
                {c.clear}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 pt-16 text-center">
              <span className="w-14 h-14 rounded-full grid place-items-center bg-light-tile dark:bg-dark-surface text-slate-600 dark:text-slate-400">
                <Bell className="w-7 h-7" aria-hidden="true" />
              </span>
              <h3 className="text-[17px] font-bold">{c.empty}</h3>
              <p className="max-w-[28ch] text-sm text-slate-600 dark:text-slate-300">{c.emptyText}</p>
            </div>
          ) : (
            sections.map(([label, rows]) => (
              <div key={label} className="mt-4">
                <h3 className="mb-2 text-[13px] font-bold text-slate-600 dark:text-slate-400 font-sans">{label}</h3>
                <ul className="rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden divide-y divide-light-border dark:divide-dark-border">
                  {rows.map((row) =>
                    row.chat ? (
                      <ChatRow key={row.id} row={row} locale={locale} onOpen={() => open(row.ids, row.url)} />
                    ) : (
                      <ItemRow key={row.item.id} item={row.item} locale={locale} onOpen={() => openItem(row.item)} />
                    ),
                  )}
                </ul>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

/** The bell of the header, with a dot while something is unread. */
export const NotificationBell: React.FC = () => {
  const c = useNotificationCopy();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={c.bell(unreadCount)}
        aria-haspopup="dialog"
        className="relative w-11 h-11 rounded-full border-[1.5px] border-light-border dark:border-dark-border bg-white dark:bg-dark-card grid place-items-center hover:bg-light-tile dark:hover:bg-dark-surface transition-colors shrink-0"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-2 end-2.5 w-2.5 h-2.5 rounded-full bg-brand-500 dark:bg-brand-accent border-2 border-white dark:border-dark-card"
            aria-hidden="true"
          />
        )}
      </button>
      {open && <NotificationCenter onClose={() => setOpen(false)} />}
    </>
  );
};
