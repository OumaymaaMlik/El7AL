import React from 'react';
import { Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useNotificationCopy } from '../../lib/notificationCopy';

export interface ReceivedReview {
  missionId?: string;
  rating: number;
  comment?: string;
  clientName?: string;
}

/** What a client rated and wrote about the artisan's job. Opens from the review notification. */
export const ProviderReviewReceivedModal: React.FC<{ review: ReceivedReview | null; onClose: () => void }> = ({
  review,
  onClose,
}) => {
  const c = useNotificationCopy().reviewWindow;
  if (!review) return null;

  return (
    <Modal isOpen onClose={onClose} title={c.title} maxWidth="sm">
      <dl>
        <div className="pb-4 border-b border-light-border dark:border-dark-border">
          <dt className="micro font-sans">{c.from}</dt>
          <dd className="mt-1.5 flex items-center gap-3">
            <span
              className="w-10 h-10 shrink-0 rounded-full grid place-items-center bg-brand-500 text-white font-display font-bold"
              aria-hidden="true"
            >
              {(review.clientName || '?').charAt(0).toUpperCase()}
            </span>
            <b className="text-lg">{review.clientName || 'Client El 7al'}</b>
          </dd>
        </div>

        <div className="py-4 border-b border-light-border dark:border-dark-border">
          <dt className="micro font-sans">{c.rating}</dt>
          <dd className="mt-2 flex items-center gap-3">
            <span className="flex gap-1 text-[#E3A21A]" role="img" aria-label={`${review.rating} / 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-7 h-7 ${n <= review.rating ? 'fill-current' : 'opacity-25'}`}
                  aria-hidden="true"
                />
              ))}
            </span>
            <span className="font-display font-extrabold text-2xl tabular-nums">{review.rating}/5</span>
          </dd>
        </div>

        <div className="pt-4">
          <dt className="micro font-sans">{c.comment}</dt>
          <dd className="mt-2">
            {review.comment ? (
              <blockquote className="rounded-2xl bg-light-tile dark:bg-dark-surface px-4 py-3.5 text-[15px] leading-relaxed">
                « {review.comment} »
              </blockquote>
            ) : (
              <p className="text-slate-600 dark:text-slate-300">{c.noComment}</p>
            )}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 w-full h-12 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
      >
        {c.close}
      </button>
    </Modal>
  );
};
