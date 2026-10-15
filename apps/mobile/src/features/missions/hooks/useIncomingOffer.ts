import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { getApiErrorMessage } from '../../../shared/utils/apiError';
import { getSocket, joinMissionRoom, leaveMissionRoom } from '../../../services/socket/socket.client';
import { useAuthStore } from '../../auth';
import { useNotificationStore } from '../../notifications';
import { acceptMission } from '../api/mission.api';
import { useMissionStore } from '../store/useMissionStore';
import type { IncomingOffer } from '../types';

export const OFFER_SECONDS = 45;

interface ProfileCategory {
  categoryId?: string;
  category?: { name?: string };
  name?: string;
}

/**
 * The artisan's incoming offer: listens for matching offers, runs the response countdown,
 * and handles accepting (-> tracking) and refusing.
 */
export function useIncomingOffer() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const setIncomingOffer = useMissionStore((state) => state.setIncomingOffer);
  const flashToast = useNotificationStore((state) => state.flashToast);

  const [offer, setOffer] = useState<IncomingOffer | null>(null);
  const [countdown, setCountdown] = useState(OFFER_SECONDS);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleNewOffer = (data: IncomingOffer) => {
      const userCategories =
        (user?.providerProfile?.categories as ProfileCategory[] | undefined)?.map(
          (c) => c.categoryId || c.category?.name || c.name || '',
        ) || [];
      const matchesCategory =
        userCategories.length === 0 ||
        userCategories.some(
          (cat: string) =>
            cat === data.categoryId ||
            cat === data.categoryName ||
            data.categoryName?.toLowerCase().includes(cat.toLowerCase()),
        );

      if (matchesCategory) {
        joinMissionRoom(data.missionId);
        setOffer(data);
        setIncomingOffer(data);
        setCountdown(OFFER_SECONDS);
        socket.emit('mission:view_offer', {
          missionId: data.missionId,
          providerName: user?.fullName || 'Artisan',
        });
      }
    };

    const handleMissionTaken = (data: { missionId: string }) => {
      if (offer && offer.missionId === data.missionId) {
        leaveMissionRoom(offer.missionId);
        setOffer(null);
        setIncomingOffer(null);
        flashToast({ title: t('offerTakenTitle'), message: t('offerTakenMsg') });
      }
    };

    socket.on('mission:new_offer', handleNewOffer);
    socket.on('mission:taken', handleMissionTaken);
    socket.on('mission:offer_withdrawn', handleMissionTaken);

    return () => {
      socket.off('mission:new_offer', handleNewOffer);
      socket.off('mission:taken', handleMissionTaken);
      socket.off('mission:offer_withdrawn', handleMissionTaken);
    };
  }, [offer, user, flashToast, setIncomingOffer, t]);

  useEffect(() => {
    if (!offer) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          leaveMissionRoom(offer.missionId);
          setOffer(null);
          setIncomingOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer, setIncomingOffer]);

  const handleAccept = async () => {
    if (!offer) return;
    setAccepting(true);
    try {
      const mData = await acceptMission(offer.missionId);
      if (mData) {
        joinMissionRoom(offer.missionId);
        setOffer(null);
        setIncomingOffer(null);
        const paired = mData.provider?.user;
        useMissionStore.getState().setActivePairingProvider({
          id: mData.provider?.id ?? '',
          fullName: paired?.fullName ?? user?.fullName ?? '',
          phoneNumber: paired?.phoneNumber,
          avatarUrl: paired?.avatarUrl,
        });
        useMissionStore.getState().setActiveMission(mData);
        router.push({ pathname: '/(tabs)/tracking', params: { id: offer.missionId } });
      }
    } catch (err) {
      leaveMissionRoom(offer.missionId);
      flashToast({
        title: t('errorTitle'),
        message: getApiErrorMessage(err, t('errAcceptOffer')),
        tone: 'error',
      });
      setOffer(null);
      setIncomingOffer(null);
    } finally {
      setAccepting(false);
    }
  };

  const handleRefuse = () => {
    if (offer) {
      leaveMissionRoom(offer.missionId);
      const socket = getSocket();
      socket.emit('mission:reject_offer', {
        missionId: offer.missionId,
        providerName: user?.fullName || 'Un prestataire',
      });
    }
    setOffer(null);
    setIncomingOffer(null);
  };

  return { offer, countdown, accepting, handleAccept, handleRefuse };
}
