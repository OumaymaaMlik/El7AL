import React, { useState, useEffect } from 'react';
import { isSearching } from '../../lib/mission';
import { STAGE_ORDER, stageIndex, useMissionCopy } from '../../lib/missionCopy';
import { LiveDot } from '../ui/LiveDot';
import { StageProgress } from '../ui/StageProgress';

interface TrackingBannerProps {
  status: string;
  categoryName?: string;
  providerFirstName?: string;
  etaMinutes?: number | null;
  radiusKm?: number;
  createdAt?: string;
}

/** The server gives up on a search after this many seconds (same on mobile). */
const SEARCH_SECONDS = 60;

const pad = (n: number) => n.toString().padStart(2, '0');

/** The green live panel on top of the tracking page: what is happening, a big figure, the six stages. */
export const TrackingBanner: React.FC<TrackingBannerProps> = ({
  status,
  categoryName = 'Dépannage',
  providerFirstName,
  etaMinutes,
  radiusKm = 25,
  createdAt,
}) => {
  const copy = useMissionCopy();
  const searching = isSearching(status);
  const completed = status === 'COMPLETED';
  const [secondsRemaining, setSecondsRemaining] = useState(SEARCH_SECONDS);

  useEffect(() => {
    if (!searching) return;

    if (createdAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      setSecondsRemaining(Math.max(0, SEARCH_SECONDS - elapsedSeconds));
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [searching, createdAt]);

  const idx = stageIndex(status);
  const key = STAGE_ORDER[idx];
  const name = providerFirstName || copy.artisanFallback;
  const hasEta = typeof etaMinutes === 'number' && etaMinutes > 0;
  const onTheWay = status === 'ACCEPTED' || status === 'EN_ROUTE';
  const nextLabel = copy.stages[idx + 1];

  // The big figure: minutes until arrival, or the time left before the search gives up.
  let bigFigure: string | null = null;
  let bigUnit = '';
  if (searching) {
    bigFigure = `${pad(Math.floor(secondsRemaining / 60))}:${pad(secondsRemaining % 60)}`;
  } else if (onTheWay && hasEta) {
    bigFigure = String(etaMinutes);
    bigUnit = 'min';
  }

  const arrival =
    onTheWay && hasEta
      ? new Date(Date.now() + (etaMinutes as number) * 60000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : searching
        ? `${radiusKm} km`
        : '';

  return (
    <section aria-label={copy.liveTag} className="panel p-6 sm:p-10 flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="min-w-0 flex-1 basis-[280px]">
          <span className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] rtl:tracking-normal text-brand-accent">
            {!completed && <LiveDot />}
            {completed ? copy.done : copy.liveTag} · {categoryName}
          </span>
          <h1 className="mt-3.5 text-[clamp(28px,3.6vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] rtl:tracking-normal rtl:leading-[1.3] text-white">
            {completed ? copy.done : copy.headline[key](name)}
          </h1>
          {arrival && <p className="mt-3 text-base text-white/90">{arrival}</p>}
        </div>

        {bigFigure && (
          <div
            className="font-display font-extrabold text-[clamp(64px,9vw,116px)] leading-[0.9] tracking-[-0.05em] tabular-nums text-white flex items-baseline gap-2.5"
            dir="ltr"
          >
            {bigFigure}
            {bigUnit && <small className="text-[0.28em] tracking-normal font-bold">{bigUnit}</small>}
          </div>
        )}
      </div>

      {!completed && (
        <div>
          <StageProgress current={idx} label={copy.stages[idx]} />
          <p className="mt-2.5 flex justify-between gap-3 text-sm text-white/85">
            <span>
              {copy.stepOf(idx + 1)} · <b className="text-white">{copy.stages[idx]}</b>
            </span>
            {nextLabel && (
              <span>
                {copy.next} : {nextLabel}
              </span>
            )}
          </p>
        </div>
      )}
    </section>
  );
};
