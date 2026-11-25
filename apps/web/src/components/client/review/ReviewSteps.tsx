import React, { useState } from 'react';
import { Award, Banknote, CheckCircle2, Send, Star } from 'lucide-react';
import { Button } from '../../ui/Button';

const ICON_BOX = 'w-16 h-16 rounded-tile flex items-center justify-center mx-auto';
const STEP_TAG = 'px-3 py-1 rounded-full font-extrabold text-xs';
const CTA = 'w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-black uppercase';

/** Step 1: the work is done and this is the price; the client confirms having paid it. */
export const ConfirmWorkStep: React.FC<{
  /** The cash amount the artisan declared, in TND (absent on jobs finished before it was required). */
  amount: number | null;
  loading: boolean;
  onConfirm: () => void;
}> = ({ amount, loading, onConfirm }) => (
  <div className="flex flex-col items-center gap-5 text-center pb-2">
    <div className={`${ICON_BOX} bg-brand-500/10 text-brand-500 dark:text-brand-accent`}>
      <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
    </div>
    <h2 className="text-xl font-black text-slate-900 dark:text-white">Travaux terminés</h2>
    {amount !== null && (
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl font-bold text-slate-900 dark:text-white">
          {amount} <span className="text-2xl text-brand-500 dark:text-brand-accent">TND</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-sm font-bold text-brand-500 dark:text-brand-accent">
          <Banknote className="w-4 h-4" aria-hidden="true" />
          Espèces
        </span>
      </div>
    )}
    <Button type="button" variant="primary" onClick={onConfirm} isLoading={loading} className={CTA}>
      {amount !== null ? "J'ai payé" : 'Confirmer'}
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
        <span className={`${STEP_TAG} bg-amber-500/10 text-amber-600`}>Étape 2 sur 2 • Évaluation</span>
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
