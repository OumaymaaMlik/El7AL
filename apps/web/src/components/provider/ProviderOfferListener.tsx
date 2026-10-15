import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IncomingOffer, IncomingOfferModal } from './IncomingOfferModal';
import { api, apiErrorMessage } from '../../services/api';
import { getSocket } from '../../services/socket';
import { onServerEvent } from '../../services/serverEvents';
import { getPosition } from '../../hooks/useGeolocation';
import { distanceKm } from '../../lib/mission';
import { useNotificationStore } from '../../store/useNotificationStore';

/**
 * Shows each new request as a pop-up on every artisan page (home, profile, tracking...), not only on the
 * home page. Mounted once in the provider layout.
 */
export const ProviderOfferListener: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [offer, setOffer] = useState<IncomingOffer | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const stopOffer = onServerEvent(socket, 'mission:new_offer', async (data) => {
      const here = typeof data.pickupLat === 'number' ? await getPosition() : null;
      setOffer({
        missionId: data.missionId,
        categoryName: data.categoryName || 'Intervention',
        clientName: data.clientName || 'Client El 7al',
        addressText: data.addressText || 'À proximité',
        distanceKm: here ? distanceKm(here.lat, here.lng, data.pickupLat, data.pickupLng) : null,
        estimatedEarnings: null,
        urgency: 'EXPRESS',
        description: data.description || '',
      });
    });
    // Someone else accepted it, or the client cancelled: the pop-up must not stay.
    const onGone = (data: { missionId?: string }) =>
      setOffer((current) => (current && (!data?.missionId || data.missionId === current.missionId) ? null : current));
    const stops = [
      stopOffer,
      onServerEvent(socket, 'mission:cancelled', onGone),
      onServerEvent(socket, 'mission:taken', onGone),
      onServerEvent(socket, 'mission:offer_withdrawn', onGone),
    ];
    return () => stops.forEach((stop) => stop());
  }, []);

  const accept = async (missionId: string) => {
    setAccepting(true);
    try {
      const res = await api.post(`/missions/${missionId}/accept`);
      if (res.data.success) {
        setOffer(null);
        addNotification({
          title: 'Mission acceptée !',
          message: 'Navigation GPS et suivi en direct lancés.',
          type: 'success',
        });
        navigate(`/provider/tracking?id=${missionId}`);
      }
    } catch (err) {
      setOffer(null);
      addNotification({
        title: 'Erreur',
        message: apiErrorMessage(err, "Impossible d'accepter la mission."),
        type: 'danger',
      });
    } finally {
      setAccepting(false);
    }
  };

  if (!offer) return null;
  return (
    <IncomingOfferModal
      offer={offer}
      isLoading={accepting}
      onAccept={accept}
      onReject={() => {
        getSocket().emit('mission:reject_offer', { missionId: offer.missionId });
        setOffer(null);
      }}
    />
  );
};
