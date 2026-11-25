import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onSend: (amount: number) => void;
}

/** The artisan finishes a job: the price the client pays in cash, which the client then sees and confirms. */
export const FinishAmountModal: React.FC<Props> = ({ isOpen, loading, onClose, onSend }) => {
  const [text, setText] = useState('');
  const amount = Number(text.replace(',', '.'));
  const valid = Number.isFinite(amount) && amount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Montant à régler par le client" maxWidth="sm">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSend(amount);
        }}
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Indiquez le prix convenu. Le client le voit et confirme l&apos;avoir payé en espèces.
        </p>
        <label className="panel p-5 flex items-baseline gap-3">
          <span className="sr-only">Montant en TND</span>
          <input
            autoFocus
            inputMode="decimal"
            maxLength={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="0"
            className="w-full min-w-0 bg-transparent text-white text-5xl font-bold outline-none placeholder:text-white/35"
          />
          <span className="text-brand-accent text-xl font-bold">TND</span>
        </label>
        <Button
          type="submit"
          className="w-full"
          isLoading={loading}
          disabled={!valid}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Envoyer au client
        </Button>
      </form>
    </Modal>
  );
};
