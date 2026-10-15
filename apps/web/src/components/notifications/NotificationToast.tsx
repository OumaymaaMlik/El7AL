import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNotificationCopy } from '../../lib/notificationCopy';

const TONES = {
  success: { Icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
  warning: { Icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' },
  danger: { Icon: XCircle, color: 'text-red-600 dark:text-red-400' },
  info: { Icon: Info, color: 'text-sky-600 dark:text-sky-400' },
};

/** The banner that slides in for a new notification, then leaves on its own. A click opens what it is about. */
export const NotificationToast: React.FC = () => {
  const toast = useNotificationStore((s) => s.toast);
  const clearToast = useNotificationStore((s) => s.clearToast);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const showReview = useNotificationStore((s) => s.showReview);
  const navigate = useNavigate();
  const c = useNotificationCopy();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(clearToast, toast.type === 'danger' ? 8000 : 5000);
    return () => clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;
  const { Icon, color } = TONES[toast.type];
  const clickable = Boolean(toast.actionUrl || toast.review);
  const go = clickable
    ? () => {
        markAsRead(toast.id);
        clearToast();
        if (toast.review) showReview(toast.review);
        else navigate(toast.actionUrl!);
      }
    : undefined;

  return (
    <div
      role={toast.type === 'danger' ? 'alert' : 'status'}
      aria-live={toast.type === 'danger' ? 'assertive' : 'polite'}
      className="fixed top-4 start-4 end-4 sm:start-auto sm:end-5 sm:max-w-sm z-[10001] flex items-start gap-3 ps-4 pe-2 py-3 rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-2xl"
    >
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {go ? (
          <button type="button" onClick={go} className="block w-full text-start">
            <b className="block text-sm">{toast.title}</b>
            {toast.message && (
              <span className="block text-[13px] text-slate-600 dark:text-slate-300">{toast.message}</span>
            )}
          </button>
        ) : (
          <>
            <b className="block text-sm">{toast.title}</b>
            {toast.message && (
              <span className="block text-[13px] text-slate-600 dark:text-slate-300">{toast.message}</span>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={clearToast}
        aria-label={c.close}
        className="w-11 h-11 -my-1 grid place-items-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-light-tile dark:hover:bg-dark-surface"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
