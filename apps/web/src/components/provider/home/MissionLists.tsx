import React from 'react';
import { ChevronRight, MapPin, Navigation } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { useMissionCopy } from '../../../lib/missionCopy';
import { useProviderCopy } from '../../../lib/providerCopy';
import type { Mission } from '../../client/ActiveMissionsList';

const PRIMARY_BUTTON =
  'self-start h-12 rounded-full bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-accent dark:text-brand-on-accent dark:hover:bg-brand-accent-hover font-bold transition-colors';

export const EmptyTab: React.FC<{ title: string; text: string; action?: React.ReactNode }> = ({
  title,
  text,
  action,
}) => (
  <div className="border-[1.5px] border-dashed border-light-border dark:border-dark-border rounded-tile px-6 py-9 flex flex-col items-start gap-3">
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="max-w-[48ch] text-slate-600 dark:text-slate-300">{text}</p>
    {action}
  </div>
);

interface MissionCardProps {
  mission: Mission;
  kind: 'ongoing' | 'available';
  busy?: boolean;
  onOpen: () => void;
  onAccept: () => void;
}

/** One job the artisan is doing, or one open offer they can accept. */
export const ProviderMissionCard: React.FC<MissionCardProps> = ({ mission: m, kind, busy, onOpen, onAccept }) => {
  const copy = useProviderCopy();
  const ongoing = kind === 'ongoing';
  return (
    <article className="surface p-5 sm:p-8 flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="micro">{ongoing ? copy.tabOngoing : copy.openOffer}</span>
          <h3 className="mt-2 text-2xl font-semibold leading-tight">{m.category?.name || 'Intervention'}</h3>
          {ongoing && (
            <p className="mt-1.5 text-slate-600 dark:text-slate-300">
              {copy.client} : {m.client?.user?.fullName || copy.client}
            </p>
          )}
        </div>
        {ongoing ? (
          <Badge variant="success">{copy.statusLabels[m.status] ?? copy.statusLabels.IN_PROGRESS}</Badge>
        ) : (
          <Badge variant="warning">{copy.openOffer}</Badge>
        )}
      </div>

      <div className="border-t border-light-border dark:border-dark-border pt-4 flex flex-col gap-2 text-[15px]">
        <p className="flex items-start gap-2 font-semibold">
          <MapPin className="w-[18px] h-[18px] mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" aria-hidden="true" />
          <span>{m.addressText || 'Tunis'}</span>
        </p>
        {m.description && <p className="text-slate-600 dark:text-slate-300">« {m.description} »</p>}
      </div>

      {ongoing ? (
        <button type="button" onClick={onOpen} className={`${PRIMARY_BUTTON} px-6 inline-flex items-center gap-2.5`}>
          <Navigation className="w-[18px] h-[18px]" aria-hidden="true" />
          {copy.open}
        </button>
      ) : (
        <button
          type="button"
          onClick={onAccept}
          disabled={busy}
          className={`${PRIMARY_BUTTON} px-8 disabled:opacity-60`}
        >
          {copy.accept}
        </button>
      )}
    </article>
  );
};

/** Past jobs, one line each; a line opens the details window. */
export const MissionHistoryList: React.FC<{ missions: Mission[]; onOpen: (mission: Mission) => void }> = ({
  missions,
  onOpen,
}) => {
  const copy = useProviderCopy();
  const missionCopy = useMissionCopy();
  return (
    <ul className="border-t border-light-border dark:border-dark-border">
      {missions.map((m) => (
        <li key={m.id} className="border-b border-light-border dark:border-dark-border">
          <button
            type="button"
            onClick={() => onOpen(m)}
            aria-haspopup="dialog"
            aria-label={`${missionCopy.details.open} : ${m.category?.name || 'Intervention'}`}
            className="w-full text-start flex items-center justify-between gap-4 px-2 py-[18px] rounded-xl hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
          >
            <span className="min-w-0 flex-1">
              <b className="block text-base">{m.category?.name || 'Intervention'}</b>
              <span className="block text-sm text-slate-600 dark:text-slate-300 truncate">
                {m.addressText || 'Tunis'}
              </span>
            </span>
            <Badge variant={m.status === 'COMPLETED' ? 'success' : 'neutral'}>
              {m.status === 'COMPLETED' ? copy.done : copy.cancelled}
            </Badge>
            <ChevronRight
              className="w-5 h-5 shrink-0 text-slate-600 dark:text-slate-300 rtl:-scale-x-100"
              aria-hidden="true"
            />
          </button>
        </li>
      ))}
    </ul>
  );
};
