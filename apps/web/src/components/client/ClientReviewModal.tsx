import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import { ConfirmWorkStep, RatingStep } from './review/ReviewSteps';
import { ReportProblem } from '../ui/ReportProblem';

type ModalStep = 'CONFIRM_WORK' | 'RATING';

interface ClientReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  providerName?: string;
  /** The cash amount the artisan declared. */
  declaredAmount?: number | string | null;
  isAlreadyCompleted?: boolean;
  onReviewSubmitted: () => void;
}

/** After the artisan reports the end of the work: the client sees the price, confirms, then rates. */
export const ClientReviewModal: React.FC<ClientReviewModalProps> = ({
  isOpen,
  onClose,
  missionId,
  providerName = 'le technicien',
  declaredAmount,
  isAlreadyCompleted = false,
  onReviewSubmitted,
}) => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [step, setStep] = useState<ModalStep>(isAlreadyCompleted ? 'RATING' : 'CONFIRM_WORK');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = declaredAmount === null || declaredAmount === undefined ? null : Number(declaredAmount);

  // The step is chosen when the window opens. The job turning "completed" while it is open must not move it.
  useEffect(() => {
    if (isOpen) setStep(isAlreadyCompleted ? 'RATING' : 'CONFIRM_WORK');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const confirmWork = async () => {
    setLoading(true);
    try {
      await api.post(`/missions/${missionId}/dual-confirm`);
      addNotification({
        title: 'Intervention confirmée',
        message: 'Vous avez confirmé la fin des travaux.',
        type: 'success',
      });
      setStep('RATING');
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, 'Impossible de confirmer la fin des travaux.'),
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/missions/${missionId}/review`, {
        rating,
        comment: comment.trim(),
        amount: amount !== null ? String(amount) : undefined,
      });
      addNotification({
        title: 'Merci pour votre évaluation',
        message: `Note de ${rating}/5 attribuée à ${providerName}.`,
        type: 'success',
      });
      onReviewSubmitted();
      onClose();
    } catch (err) {
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, "Impossible d'enregistrer l'évaluation."),
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      {step === 'CONFIRM_WORK' && (
        <>
          <ConfirmWorkStep amount={amount} loading={loading} onConfirm={() => void confirmWork()} />
          <ReportProblem missionId={missionId} className="w-full" />
        </>
      )}
      {step === 'RATING' && (
        <RatingStep
          providerName={providerName}
          rating={rating}
          onRating={setRating}
          comment={comment}
          onComment={setComment}
          loading={loading}
          onSubmit={(e) => void submitReview(e)}
          onSkip={onClose}
        />
      )}
    </Modal>
  );
};
