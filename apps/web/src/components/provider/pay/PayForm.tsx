import React, { useEffect, useState } from 'react';
import { Camera, Copy, Send } from 'lucide-react';
import { api, apiErrorMessage } from '../../../services/api';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useWalletCopy } from '../../../lib/walletCopy';
import { Button } from '../../ui/Button';

const CARD = 'bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7';

interface Props {
  /** What is owed: the amount to transfer (the server decides it, so it cannot be mistyped). */
  due: number;
  rib: string | null;
  /** Called once the receipt was sent. */
  onSent: () => void;
}

/** The transfer form: amount, where to send it, the photo of the receipt and one button. */
export const PayForm: React.FC<Props> = ({ due, rib, onSent }) => {
  const copy = useWalletCopy();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const copyRib = async () => {
    if (!rib) return;
    try {
      await navigator.clipboard.writeText(rib);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // the number stays selectable on screen
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return setError(copy.errNoProof);
    setError(null);
    setSending(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const uploaded = await api.post('/uploads/document', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await api.post('/wallet/topup', { receiptPhotoUrl: uploaded.data?.url });
      addNotification({ title: copy.payTitle, message: copy.sentToast, type: 'success' });
      onSent();
    } catch (err) {
      setError(apiErrorMessage(err, copy.errNoProof));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="panel p-5 sm:p-7 flex flex-col gap-3">
        <span className="micro !text-white/80">{copy.amountLabel}</span>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-white text-5xl font-bold">{due}</span>
          <span className="text-brand-accent text-xl font-bold">TND</span>
        </div>
      </div>

      {rib && (
        <div className={`${CARD} flex items-center justify-between gap-3`}>
          <div className="min-w-0">
            <span className="block text-xs text-slate-500 dark:text-slate-400">{copy.ribLabel}</span>
            <span className="block font-bold break-words select-all">{rib}</span>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyRib} leftIcon={<Copy className="w-4 h-4" />}>
            {copied ? copy.copied : copy.copyRib}
          </Button>
        </div>
      )}

      <label
        className={`${CARD} flex items-center gap-4 cursor-pointer border-dashed ${file ? 'border-brand-500' : ''}`}
      >
        <span className="w-16 h-20 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-6 h-6 text-slate-500" aria-hidden="true" />
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold">{copy.proofTitle}</span>
          <span className="block text-sm text-slate-500 dark:text-slate-400">
            {file ? copy.proofAdded : copy.proofAdd}
          </span>
        </span>
        {file && <span className="text-sm font-bold text-brand-500 dark:text-brand-accent">{copy.proofChange}</span>}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" isLoading={sending} leftIcon={<Send className="w-4 h-4" />}>
        {sending ? copy.sending : copy.send}
      </Button>
    </form>
  );
};
