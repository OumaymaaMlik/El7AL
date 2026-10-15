import { useState } from 'react';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { useNotificationStore } from '../../notifications/store/useNotificationStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { logger } from '../../../shared/utils/logger';
import type { TranslationKeys } from '../../../shared/i18n/translations';
import { dualConfirm, markArrived, startRoute, startWork, submitReview } from '../api/mission.api';
import { useMissionStore } from '../store/useMissionStore';

interface Options {
  /** Overrides the mission targeted by the actions (defaults to the store's current mission). */
  missionId?: string | null;
  /** Called after the review is submitted (or fails) and the active mission is cleared. */
  onReviewDone?: () => void;
}

/**
 * The in-mission actions (route, arrival, work, completion, payment, review) and the
 * modals that guide the client and the artisan through them.
 */
export function useMissionFlow({ missionId: overrideId, onReviewDone }: Options = {}) {
  const { t } = useTranslation();
  const flashToast = useNotificationStore((state) => state.flashToast);
  const storeMissionId = useMissionStore((state) => state.searchingMissionId);
  const missionId = overrideId ?? storeMissionId;
  const clearActiveMission = useMissionStore((state) => state.clearActiveMission);

  const [actionLoading, setActionLoading] = useState(false);
  const [gpsOpen, setGpsOpen] = useState(false);
  const [dualOpen, setDualOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  /** Runs a mission action with a loading flag; failures show a toast. Returns true on success. */
  const run = async (action: (id: string) => Promise<void>, errorKey: TranslationKeys): Promise<boolean> => {
    if (!missionId) return false;
    setActionLoading(true);
    try {
      await action(missionId);
      return true;
    } catch (e) {
      flashToast({ title: t('errorTitle'), message: getApiErrorMessage(e, t(errorKey)), tone: 'error' });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const startDrive = () => run(startRoute, 'errStartRoute');
  const arrived = () => run(markArrived, 'errUpdateStatus');
  const beginWork = () => run(startWork, 'errStartWork');
  const providerFinish = () => run(dualConfirm, 'errFinishWork');

  const clientConfirm = async () => {
    if (await run(dualConfirm, 'errConfirmFinish')) {
      setDualOpen(false);
      setPaymentOpen(true);
    }
  };

  const submitPayment = (_method: string, amount: string) => {
    setPaymentAmount(amount);
    setPaymentOpen(false);
    setRatingOpen(true);
  };

  const submitRating = async (rating: number, comment: string) => {
    if (!missionId) return;
    setActionLoading(true);
    try {
      await submitReview(missionId, rating, comment, paymentAmount);
    } catch (e) {
      logger.warn('Submit review warning:', e);
    } finally {
      setActionLoading(false);
      setRatingOpen(false);
      clearActiveMission();
      flashToast({ title: t('thanksTitle'), message: t('reviewSubmitted'), tone: 'success' });
      onReviewDone?.();
    }
  };

  return {
    actionLoading,
    gpsOpen,
    setGpsOpen,
    dualOpen,
    setDualOpen,
    paymentOpen,
    setPaymentOpen,
    ratingOpen,
    setRatingOpen,
    startDrive,
    arrived,
    beginWork,
    providerFinish,
    clientConfirm,
    submitPayment,
    submitRating,
  };
}

export type MissionFlow = ReturnType<typeof useMissionFlow>;
