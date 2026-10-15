import React, { useState, useEffect, useId, useRef } from 'react';
import { Check } from 'lucide-react';
import { LiveDot } from '../ui/LiveDot';
import { useProviderCopy } from '../../lib/providerCopy';

export interface IncomingOffer {
  missionId: string;
  categoryName: string;
  clientName?: string;
  addressText: string;
  distanceKm?: number | null;
  estimatedEarnings?: number | null;
  urgency?: 'EXPRESS' | 'PLANIFIE' | 'STANDARD';
  description?: string;
}

interface IncomingOfferModalProps {
  offer: IncomingOffer | null;
  onAccept: (missionId: string) => void;
  onDecline?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

/** Seconds an artisan has to answer an offer (same as mobile). */
const OFFER_SECONDS = 45;
const RING_LENGTH = 163.4;

/** A new request popping up: what, where, how far, and a countdown ring to answer. */
export const IncomingOfferModal: React.FC<IncomingOfferModalProps> = ({
  offer,
  onAccept,
  onDecline,
  onReject,
  isLoading = false,
}) => {
  const copy = useProviderCopy();
  const titleId = useId();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(OFFER_SECONDS);

  const handleDismiss = () => {
    if (onDecline) onDecline();
    else if (onReject) onReject();
  };

  // The countdown must call the latest handler without restarting each render.
  const dismissRef = useRef(handleDismiss);
  dismissRef.current = handleDismiss;

  useEffect(() => {
    if (!offer) return;
    setSecondsRemaining(OFFER_SECONDS);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          dismissRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  if (!offer) return null;

  // "Prénom N." keeps the client's surname private until the job is accepted.
  const formatClientName = (fullName?: string) => {
    if (!fullName) return 'Client El 7al';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60">
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white dark:bg-dark-card text-slate-900 dark:text-white rounded-tile border-[1.5px] border-slate-900 dark:border-slate-100 p-5 sm:p-8 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] rtl:tracking-normal">
            <LiveDot />
            {copy.offerTag}
          </span>
          <div
            className="relative w-[60px] h-[60px] shrink-0"
            role="timer"
            aria-label={`${copy.offerReplyIn} ${secondsRemaining}`}
          >
            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                strokeWidth="4"
                className="stroke-light-border dark:stroke-dark-border"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - secondsRemaining / OFFER_SECONDS)}
                className="stroke-brand-500 dark:stroke-brand-accent"
              />
            </svg>
            <b className="absolute inset-0 grid place-items-center font-display font-bold text-xl tabular-nums">
              {secondsRemaining}
            </b>
          </div>
        </div>

        <div>
          <h2 id={titleId} className="text-[clamp(24px,3vw,32px)] font-semibold leading-[1.15]">
            {offer.categoryName || 'Intervention'}
          </h2>
          {offer.description && <p className="mt-2 text-slate-600 dark:text-slate-300">« {offer.description} »</p>}
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-light-border dark:border-dark-border pt-[18px]">
          {typeof offer.distanceKm === 'number' && (
            <div>
              <dt className="micro">{copy.offerDistance}</dt>
              <dd className="mt-1 font-display font-bold text-2xl tabular-nums">
                {offer.distanceKm.toFixed(1)} {copy.km}
              </dd>
              <dd className="text-[13px] text-slate-600 dark:text-slate-300">{copy.fromYou}</dd>
            </div>
          )}
          <div>
            <dt className="micro">{copy.offerClient}</dt>
            <dd className="mt-1 font-display font-bold text-2xl">{formatClientName(offer.clientName)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="micro">{copy.offerAddress}</dt>
            <dd className="mt-1 font-semibold leading-snug">{offer.addressText || 'Tunis, Tunisie'}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAccept(offer.missionId)}
            disabled={isLoading}
            className="flex-1 min-w-[180px] h-14 rounded-full bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover font-bold text-base inline-flex items-center justify-center gap-2.5 disabled:opacity-60 transition-colors"
          >
            <Check className="w-5 h-5" aria-hidden="true" />
            {isLoading ? copy.offerAccepting : copy.offerAccept}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isLoading}
            className="h-14 px-8 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold text-base hover:bg-light-tile dark:hover:bg-dark-surface disabled:opacity-60 transition-colors"
          >
            {copy.offerDecline}
          </button>
        </div>

        <p className="text-[13px] text-slate-600 dark:text-slate-300">{copy.offerCommission}</p>
      </article>
    </div>
  );
};
