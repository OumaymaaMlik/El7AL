import React from 'react';
import { stageIndex, useMissionCopy } from '../../lib/missionCopy';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LiveDot } from '../ui/LiveDot';
import { StageProgress } from '../ui/StageProgress';

interface ProviderTrackingBannerProps {
  status: string;
  categoryName?: string;
  distanceKm?: number | null;
  etaMinutes?: number | null;
}

const HEADLINES = {
  fr: {
    ACCEPTED: 'Mission acceptée, prête à partir',
    EN_ROUTE: 'En route vers le client',
    ARRIVED: 'Vous êtes sur place',
    IN_PROGRESS: 'Intervention en cours',
    DUAL_CONFIRM: 'En attente de la validation du client',
    COMPLETED: 'Intervention terminée',
    hint: 'Démarrez le trajet pour partager votre position en direct.',
    away: (km: string) => `Le client est à ~${km} km de vous.`,
    trip: 'trajet estimé',
  },
  en: {
    ACCEPTED: 'Request accepted, ready to go',
    EN_ROUTE: 'On the way to the customer',
    ARRIVED: 'You are on site',
    IN_PROGRESS: 'Job in progress',
    DUAL_CONFIRM: 'Waiting for the customer to confirm',
    COMPLETED: 'Job completed',
    hint: 'Start the trip to share your position live.',
    away: (km: string) => `The customer is ~${km} km from you.`,
    trip: 'estimated trip',
  },
  ar: {
    ACCEPTED: 'تم قبول الطلب، جاهز للانطلاق',
    EN_ROUTE: 'في الطريق إلى العميل',
    ARRIVED: 'وصلت إلى المكان',
    IN_PROGRESS: 'التدخل جارٍ',
    DUAL_CONFIRM: 'في انتظار تأكيد العميل',
    COMPLETED: 'انتهى التدخل',
    hint: 'ابدأ الرحلة لمشاركة موقعك مباشرة.',
    away: (km: string) => `العميل على بعد ~${km} كم منك.`,
    trip: 'مدة الرحلة المقدّرة',
  },
} as const;

/** The artisan's live panel: where the job stands, the trip estimate, the six stages. */
export const ProviderTrackingBanner: React.FC<ProviderTrackingBannerProps> = ({
  status,
  categoryName = 'Intervention',
  distanceKm = null,
  etaMinutes = null,
}) => {
  const copy = useMissionCopy();
  const language = useLanguageStore((s) => s.language);
  const h = HEADLINES[language] ?? HEADLINES.fr;
  const completed = status === 'COMPLETED';
  const heading = status === 'ACCEPTED' || status === 'EN_ROUTE';
  const idx = stageIndex(status);
  const nextLabel = copy.stages[idx + 1];
  const title = h[status as keyof typeof h] as string | undefined;
  const showEta = heading && typeof etaMinutes === 'number';

  return (
    <section aria-label={copy.liveTag} className="panel p-6 sm:p-10 flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="min-w-0 flex-1 basis-[280px]">
          <span className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] rtl:tracking-normal text-brand-accent">
            {!completed && <LiveDot />}
            {copy.liveTag} · {categoryName}
          </span>
          <h1 className="mt-3.5 text-[clamp(28px,3.6vw,46px)] font-bold leading-[1.08] tracking-[-0.02em] rtl:tracking-normal rtl:leading-[1.3] text-white">
            {title ?? h.ACCEPTED}
          </h1>
          {heading && (
            <p className="mt-3 text-base text-white/90">
              {typeof distanceKm === 'number' ? `${h.away(distanceKm.toFixed(1))} ` : ''}
              {status === 'ACCEPTED' ? h.hint : ''}
            </p>
          )}
        </div>

        {showEta && (
          <div className="text-end" dir="ltr">
            <div className="font-display font-extrabold text-[clamp(64px,9vw,116px)] leading-[0.9] tracking-[-0.05em] tabular-nums text-white flex items-baseline gap-2.5">
              {Math.max(0, etaMinutes as number)}
              <small className="text-[0.28em] tracking-normal font-bold">min</small>
            </div>
            <span className="text-sm text-white/85">{h.trip}</span>
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
