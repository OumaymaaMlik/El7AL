import React, { useState } from 'react';
import { Award, Banknote, CheckCircle2, Send, Star } from 'lucide-react';
import { Button } from '../../ui/Button';

const ICON_BOX = 'w-16 h-16 rounded-tile flex items-center justify-center mx-auto';
const STEP_TAG = 'px-3 py-1 rounded-full font-extrabold text-xs';
const CTA = 'w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase';

/** Step 1: the artisan says the work is done; the client confirms it. */
export const ConfirmWorkStep: React.FC<{
  providerName: string;
  categoryName: string;
  loading: boolean;
  onConfirm: () => void;
}> = ({ providerName, categoryName, loading, onConfirm }) => (
  <div className="space-y-6 text-center py-2">
    <div className={`${ICON_BOX} bg-brand-500/10 text-brand-500 dark:text-brand-accent`}>
      <CheckCircle2 className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <span className={`${STEP_TAG} bg-brand-500/10 text-brand-500 dark:text-brand-accent`}>
        Étape 1 sur 3 • Confirmation de fin de travaux
      </span>
      <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">Fin des travaux indiquée</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        L&apos;artisan <strong className="text-slate-900 dark:text-white">{providerName}</strong> a indiqué que le
        travail pour <strong className="text-slate-900 dark:text-white">{categoryName}</strong> est terminé.
      </p>
    </div>
    <Button type="button" variant="primary" onClick={onConfirm} isLoading={loading} className={CTA}>
      Confirmer la fin des travaux
    </Button>
  </div>
);

/** Step 2: the amount the client paid the artisan in cash (cash is the only payment for now). */
export const CashAmountStep: React.FC<{
  amount: string;
  onAmount: (v: string) => void;
  valid: boolean;
  onValidate: () => void;
}> = ({ amount, onAmount, valid, onValidate }) => (
  <div className="space-y-6 text-center py-2">
    <div className={`${ICON_BOX} bg-emerald-500/10 text-emerald-600`}>
      <Banknote className="w-8 h-8" />
    </div>
    <div className="space-y-2">
      <span className={`${STEP_TAG} bg-emerald-500/10 text-emerald-600`}>Étape 2 sur 3 • Règlement</span>
      <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">Règlement en espèces</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Vous réglez l&apos;artisan directement, en main propre.
      </p>
      <label className="block text-xs text-slate-500 dark:text-slate-400 text-start">
        Montant réglé à l&apos;artisan (TND)
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          placeholder="ex. 45"
          className="mt-1 w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </label>
    </div>
    <Button
      type="button"
      variant="primary"
      onClick={onValidate}
      disabled={!valid}
      leftIcon={<CheckCircle2 className="w-4 h-4" />}
      className={CTA}
    >
      Valider le montant
    </Button>
  </div>
);

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent (5/5)',
  4: 'Très bien (4/5)',
  3: 'Moyen (3/5)',
  2: 'Insatisfaisant (2/5)',
  1: 'Très mauvais (1/5)',
};

interface RatingStepProps {
  providerName: string;
  rating: number;
  onRating: (n: number) => void;
  comment: string;
  onComment: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onSkip: () => void;
}

/** Step 3: stars and an optional comment, sent to the artisan. */
export const RatingStep: React.FC<RatingStepProps> = ({
  providerName,
  rating,
  onRating,
  comment,
  onComment,
  loading,
  onSubmit,
  onSkip,
}) => {
  const [hover, setHover] = useState(0);
  return (
    <form onSubmit={onSubmit} className="space-y-6 text-center py-2">
      <div className={`${ICON_BOX} bg-brand-500/10 text-brand-500 dark:text-brand-accent`}>
        <Award className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <span className={`${STEP_TAG} bg-amber-500/10 text-amber-600`}>Étape 3 sur 3 • Évaluation</span>
        <h2 className="text-xl font-black text-slate-900 dark:text-white pt-1">
          Évaluez l&apos;intervention de {providerName}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Partagez votre expérience avec cet artisan</p>
      </div>

      <div className="flex items-center justify-center gap-2 py-2" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} sur 5`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRating(star)}
            className="p-1 transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full"
          >
            <Star
              className={`w-8 h-8 ${star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
            />
          </button>
        ))}
      </div>
      <div className="text-xs font-bold text-amber-600 dark:text-amber-400">{RATING_LABELS[rating]}</div>

      <div className="text-start">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Commentaire</label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => onComment(e.target.value)}
          placeholder="Partagez votre expérience avec cet artisan..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onSkip} disabled={loading}>
          Ignorer
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          leftIcon={<Send className="w-4 h-4" />}
          className="font-extrabold px-6 uppercase"
        >
          Soumettre mon avis
        </Button>
      </div>
    </form>
  );
};
