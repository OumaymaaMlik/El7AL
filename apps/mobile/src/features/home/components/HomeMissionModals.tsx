import { AmountSheet } from '../../missions/components/AmountSheet';
import { DualCompletionModal } from '../../missions/components/DualCompletionModal';
import { LiveGpsNavigationModal } from '../../missions/components/LiveGpsNavigationModal';
import { ProviderReviewReceivedModal } from '../../missions/components/ProviderReviewReceivedModal';
import { RatingModal } from '../../missions/components/RatingModal';
import type { MissionFlow } from '../../missions/hooks/useMissionFlow';
import { useMissionStore } from '../../missions/store/useMissionStore';

interface Props {
  flow: MissionFlow;
}

/** The dialogs and sheets of a mission that open over the home page: navigation, payment, rating, reviews. */
export function HomeMissionModals({ flow }: Props) {
  const partner = useMissionStore((state) => state.activePairingProvider);
  const activeMission = useMissionStore((state) => state.activeMission);
  const distanceKm = useMissionStore((state) => state.distanceKm);
  const etaMinutes = useMissionStore((state) => state.etaMinutes);
  const reviewData = useMissionStore((state) => state.reviewData);
  const setReviewData = useMissionStore((state) => state.setReviewData);
  const storedAmount = useMissionStore((state) => state.declaredAmount);
  const declaredAmount =
    storedAmount ?? (activeMission?.declaredAmount != null ? Number(activeMission.declaredAmount) : null);

  return (
    <>
      <LiveGpsNavigationModal
        visible={flow.gpsOpen}
        onClose={() => flow.setGpsOpen(false)}
        onStartDrive={flow.startDrive}
        destinationAddress={activeMission?.addressText ?? undefined}
        destinationLat={activeMission?.pickupLat}
        destinationLng={activeMission?.pickupLng}
        distanceKm={distanceKm}
        etaMinutes={etaMinutes}
        loading={flow.actionLoading}
      />
      <DualCompletionModal
        visible={flow.dualOpen}
        onConfirm={flow.clientConfirm}
        onClose={() => flow.setDualOpen(false)}
        loading={flow.actionLoading}
        amount={declaredAmount}
        providerName={partner?.fullName}
      />
      <AmountSheet
        visible={flow.amountOpen}
        onClose={() => flow.setAmountOpen(false)}
        onSend={flow.sendAmount}
        loading={flow.actionLoading}
      />
      <RatingModal
        visible={flow.ratingOpen}
        onSubmit={flow.submitRating}
        onClose={() => flow.setRatingOpen(false)}
        loading={flow.actionLoading}
      />
      <ProviderReviewReceivedModal visible={!!reviewData} data={reviewData} onClose={() => setReviewData(null)} />
    </>
  );
}
