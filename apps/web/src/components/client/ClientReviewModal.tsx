import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { api, apiErrorMessage } from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import { CashAmountStep, ConfirmWorkStep, RatingStep } from './review/ReviewSteps';

type ModalStep = 'CONFIRM_WORK' | 'PAYMENT' | 'RATING';

interface ClientReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
  providerName?: string;
  categoryName?: string;
  isAlreadyCompleted?: boolean;
  onReviewSubmitted: () => void;
}

/** After the artisan reports the end of the work: the client confirms, enters the cash amount, then rates. */
export const ClientReviewModal: React.FC<ClientReviewModalProps> = ({
  isOpen,
  onClose,
  missionId,
  providerName = 'le technicien',
  categoryName = 'Intervention',
  isAlreadyCompleted = false,
  onReviewSubmitted,
}) => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [step, setStep] = useState<ModalStep>(isAlreadyCompleted ? 'RATING' : 'CONFIRM_WORK');
  const [amount, setAmount] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const amountValue = Number(amount.replace(',', '.'));
  const amountValid = Number.isFinite(amountValue) && amountValue > 0;

  useEffect(() => {
    if (isOpen) setStep(isAlreadyCompleted ? 'RATING' : 'CONFIRM_WORK');
  }, [isOpen, isAlreadyCompleted]);

  const confirmWork = async () => {
    setLoading(true);
    try {
      await api.post(`/missions/${missionId}/dual-confirm`);
      addNotification({
        title: 'Intervention confirmée',
        message: 'Vous avez confirmé la fin des travaux.',
        type: 'success',
      });
      setStep('PAYMENT');
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
        amount: amountValid ? String(amountValue) : undefined,
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
        <ConfirmWorkStep
          providerName={providerName}
          categoryName={categoryName}
          loading={loading}
          onConfirm={() => void confirmWork()}
        />
      )}
      {step === 'PAYMENT' && (
        <CashAmountStep amount={amount} onAmount={setAmount} valid={amountValid} onValidate={() => setStep('RATING')} />
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
