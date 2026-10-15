import React from 'react';
import { useProviderCopy } from '../../../lib/providerCopy';

/** Shown while the admin has not approved the artisan yet, or after a refusal with its reason. */
export const VerificationBanner: React.FC<{ status: string; note: string | null }> = ({ status, note }) => {
  const copy = useProviderCopy();
  const rejected = status === 'REJECTED';
  return (
    <div
      role="status"
      className={`rounded-tile border-[1.5px] p-5 sm:p-6 ${
        rejected
          ? 'border-red-700 bg-red-50 dark:border-red-400 dark:bg-red-950/30'
          : 'border-amber-600 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30'
      }`}
    >
      <h2 className="text-xl font-bold">{rejected ? copy.rejectedTitle : copy.pendingTitle}</h2>
      {rejected ? (
        <>
          {note && (
            <p className="mt-2 text-[15px]">
              <b>{copy.rejectedReason} :</b> {note}
            </p>
          )}
          <p className="mt-2 text-slate-700 dark:text-slate-300">{copy.rejectedText}</p>
        </>
      ) : (
        <p className="mt-2 text-slate-700 dark:text-slate-300">{copy.pendingText}</p>
      )}
    </div>
  );
};
