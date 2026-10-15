import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  hideHeader?: boolean;
  /** Accepted for older call sites; the width is set by `maxWidth`. */
  size?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * A dialog that screen readers announce as one, keeps keyboard focus inside while open,
 * closes with Escape, and gives focus back to whatever opened it.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  hideHeader = false,
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog (the first field if there is one, otherwise the panel itself).
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('input:not([disabled]), textarea, select');
    (first ?? panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content Dialog */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title && !hideHeader ? titleId : undefined}
        aria-label={title && !hideHeader ? undefined : title || 'Fenêtre de dialogue'}
        tabIndex={-1}
        className={`relative w-full ${MAX_WIDTHS[maxWidth]} bg-white dark:bg-dark-card rounded-tile shadow-2xl border border-light-border dark:border-dark-border p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto focus:outline-none`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h3 id={titleId} className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 -me-2 grid place-items-center rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
