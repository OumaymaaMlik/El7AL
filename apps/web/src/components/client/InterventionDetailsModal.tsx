import React from 'react';
import { MapPin, Phone, Star } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Mission } from './ActiveMissionsList';
import { getCategoryIcon } from './CategoryGrid';
import { useMissionCopy } from '../../lib/missionCopy';
import { useLanguageStore } from '../../store/useLanguageStore';

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-3.5 border-b border-light-border dark:border-dark-border last:border-b-0">
    <dt className="micro font-sans">{label}</dt>
    <dd className="mt-1.5 text-[15px]">{children}</dd>
  </div>
);

/** Everything known about one past intervention: when, where, what, who, how it ended, the review. Used by both spaces. */
export const InterventionDetailsModal: React.FC<{
  mission: Mission | null;
  onClose: () => void;
  /** Who is looking: a client sees the artisan, an artisan sees the client. */
  viewer?: 'CLIENT' | 'PROVIDER';
}> = ({ mission, onClose, viewer = 'CLIENT' }) => {
  const copy = useMissionCopy();
  const d = copy.details;
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'ar' ? 'ar-TN-u-nu-latn' : language === 'en' ? 'en-GB' : 'fr-FR';

  if (!mission) return null;
  const completed = mission.status === 'COMPLETED';
  const cancelled = mission.status === 'CANCELLED';
  const minutes =
    mission.startedAt && mission.completedAt
      ? Math.max(
          1,
          Math.round((new Date(mission.completedAt).getTime() - new Date(mission.startedAt).getTime()) / 60000),
        )
      : null;
  const when = new Date(mission.createdAt).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' });
  const asPro = viewer === 'PROVIDER';
  // The other party: the artisan for a client, the client for an artisan.
  const other = asPro ? mission.client?.user : mission.provider?.user;

  return (
    <Modal isOpen onClose={onClose} title={d.title} maxWidth="md">
      <div className="flex items-center gap-3.5 pb-4 border-b border-light-border dark:border-dark-border">
        <span className="w-12 h-12 shrink-0 rounded-2xl grid place-items-center bg-light-tile dark:bg-dark-surface text-brand-500 dark:text-brand-accent [&>svg]:w-6 [&>svg]:h-6">
          {getCategoryIcon(mission.category?.name || '', mission.category?.icon)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold truncate">{mission.category?.name}</h3>
          <p className="text-[13px] text-slate-600 dark:text-slate-300">
            {d.reference} #{mission.id.slice(-6).toUpperCase()}
          </p>
        </div>
        <Badge variant={completed ? 'success' : 'neutral'}>
          {completed ? copy.done : cancelled ? copy.cancelled : mission.status}
        </Badge>
      </div>

      <dl>
        <Row label={d.date}>{when}</Row>
        {minutes !== null && <Row label={d.duration}>{d.minutes(minutes)}</Row>}
        <Row label={d.address}>
          <span className="flex items-start gap-2">
            <MapPin
              className="w-[18px] h-[18px] mt-0.5 shrink-0 text-slate-600 dark:text-slate-400"
              aria-hidden="true"
            />
            {mission.addressText}
          </span>
        </Row>
        <Row label={d.problem}>
          {mission.description ? (
            mission.description
          ) : (
            <span className="text-slate-600 dark:text-slate-300">{d.noProblem}</span>
          )}
        </Row>
        <Row label={asPro ? d.client : d.artisan}>
          {other ? (
            <span className="flex items-center gap-3">
              <span
                className="w-10 h-10 shrink-0 rounded-full grid place-items-center overflow-hidden bg-brand-500 text-white font-display font-bold"
                aria-hidden="true"
              >
                {other.avatarUrl ? (
                  <img src={other.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  other.fullName.charAt(0).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate">{other.fullName}</b>
              </span>
              {other.phoneNumber && (
                <a
                  href={`tel:${other.phoneNumber}`}
                  className="h-10 px-4 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 inline-flex items-center gap-2 text-sm font-bold hover:bg-light-tile dark:hover:bg-dark-surface"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span dir="ltr">{other.phoneNumber}</span>
                </a>
              )}
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">{asPro ? '' : d.noArtisan}</span>
          )}
        </Row>
        {completed && (
          <Row label={asPro ? d.reviewReceived : d.review}>
            {mission.review ? (
              <span className="block">
                <span className="flex gap-0.5 text-[#E3A21A]" role="img" aria-label={`${mission.review.rating} / 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-5 h-5 ${n <= mission.review!.rating ? 'fill-current' : 'opacity-30'}`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                {mission.review.comment && <span className="block mt-1.5">« {mission.review.comment} »</span>}
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-300">{asPro ? d.noReviewReceived : d.noReview}</span>
            )}
          </Row>
        )}
        {cancelled && (
          <Row label={d.reason}>
            <span className="block font-semibold">
              {asPro
                ? mission.cancelledByRole === 'CLIENT'
                  ? d.byClient
                  : d.youCancelled
                : mission.cancelledByRole === 'PROVIDER'
                  ? d.byArtisan
                  : d.byYou}
            </span>
            {mission.cancellationReason && (
              <span className="block text-slate-600 dark:text-slate-300">{mission.cancellationReason}</span>
            )}
          </Row>
        )}
      </dl>

      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full h-12 rounded-full border-[1.5px] border-slate-900 dark:border-slate-100 font-bold hover:bg-light-tile dark:hover:bg-dark-surface transition-colors"
      >
        {d.close}
      </button>
    </Modal>
  );
};
