import React, { useState } from 'react';
import { Flag, Send } from 'lucide-react';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useReportCopy } from '../../lib/reportCopy';
import { Button } from './Button';
import { Modal } from './Modal';

/** "Report a problem" about one intervention, for its client or its artisan. El 7al's admins receive it. */
export const ReportProblem: React.FC<{ missionId: string; className?: string }> = ({ missionId, className = '' }) => {
  const copy = useReportCopy();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = reason.trim().length >= 5;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    // The form may sit inside another one (the review window): this submission stops here.
    event.stopPropagation();
    if (!ready) return;
    setSending(true);
    setError(null);
    try {
      await api.post('/disputes', { missionId, reason: reason.trim() });
      addNotification({ title: copy.sentTitle, message: copy.sentText, type: 'success' });
      setReason('');
      setOpen(false);
    } catch (err) {
      setError(apiErrorMessage(err, copy.failed));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`min-h-[44px] inline-flex items-center justify-center gap-2 text-sm font-semibold underline underline-offset-[3px] text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 ${className}`}
      >
        <Flag className="w-4 h-4" aria-hidden="true" />
        {copy.button}
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={copy.title} maxWidth="md">
        <form onSubmit={(e) => void send(e)} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">{copy.lead}</p>
          <textarea
            rows={4}
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.title}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={!ready}
            isLoading={sending}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {copy.send}
          </Button>
        </form>
      </Modal>
    </>
  );
};
