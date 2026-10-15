import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  /** `danger` for actions that cannot be undone (cancelling a request). */
  tone?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** The in-app replacement for window.confirm: styled, translated, keyboard and screen-reader friendly. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        {tone === 'danger' && (
          <span className="mt-0.5 shrink-0 w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </span>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={tone === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
