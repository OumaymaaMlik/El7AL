import { create } from 'zustand';
import { translate } from '../../../shared/store/useLanguageStore';
import type { ActiveMission, IncomingOffer, PairedProvider, ReviewData } from '../types';

/** What the closing "Merci" page shows once a job is paid and rated. */
export interface ThanksData {
  providerName: string | null;
  amount: number | null;
  rating: number;
}

/** How the artisan search is going, for the search page. */
export type SearchPhase = 'idle' | 'searching' | 'found' | 'none';

interface MissionStoreState {
  activeMission: ActiveMission | null;
  activePairingProvider: PairedProvider | null;
  incomingOffer: IncomingOffer | null;
  isSearching: boolean;
  searchStatusText: string;
  searchTimerSeconds: number;
  searchRadiusKm: number;
  searchingMissionId: string | null;

  // Phase 5 Lifecycle States
  missionStatus:
    'BROADCASTED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'DUAL_CONFIRM' | 'COMPLETED' | null;
  etaMinutes: number;
  distanceKm: number;
  /** Latest known position of the artisan on this mission (own GPS for the artisan, the live stream for the client). */
  providerPosition: { lat: number; lng: number } | null;
  startedAt: string | null;
  providerConfirmed: boolean;
  clientConfirmed: boolean;
  /** The amount in TND the artisan declared for the client to confirm in cash. */
  declaredAmount: number | null;
  reviewData: ReviewData | null;
  thanks: ThanksData | null;
  searchPhase: SearchPhase;

  setActiveMission: (mission: ActiveMission | null) => void;
  setActivePairingProvider: (provider: PairedProvider | null) => void;
  setIncomingOffer: (offer: IncomingOffer | null) => void;
  setReviewData: (data: ReviewData | null) => void;
  setThanks: (data: ThanksData | null) => void;
  setSearchPhase: (phase: SearchPhase) => void;
  startSearching: (missionId: string) => void;
  updateSearchStatus: (statusText: string) => void;
  updateMissionState: (partial: Partial<MissionStoreState>) => void;
  stopSearching: () => void;
  clearActiveMission: () => void;
}

export const useMissionStore = create<MissionStoreState>((set) => ({
  activeMission: null,
  activePairingProvider: null,
  incomingOffer: null,
  isSearching: false,
  searchStatusText: translate('searchRange5km') || "Recherche d'artisans dans un rayon de 5 km...",
  searchTimerSeconds: 60,
  searchRadiusKm: 5,
  searchingMissionId: null,

  missionStatus: null,
  etaMinutes: 0,
  distanceKm: 0,
  providerPosition: null,
  startedAt: null,
  providerConfirmed: false,
  clientConfirmed: false,
  declaredAmount: null,
  reviewData: null,
  thanks: null,
  searchPhase: 'idle',

  setActiveMission: (mission) => {
    const isAct = Boolean(
      mission && mission.status !== 'BROADCASTED' && mission.status !== 'CANCELLED' && mission.status !== 'COMPLETED',
    );
    set({
      activeMission: mission,
      searchingMissionId: mission?.id || null,
      ...(mission && isAct
        ? { isSearching: false, missionStatus: mission.status as MissionStoreState['missionStatus'] }
        : {}),
    });
  },
  setActivePairingProvider: (provider) =>
    set({
      activePairingProvider: provider,
      ...(provider ? { isSearching: false } : {}),
    }),
  setIncomingOffer: (offer) => set({ incomingOffer: offer }),
  setReviewData: (data) => set({ reviewData: data }),
  setThanks: (data) => set({ thanks: data }),
  setSearchPhase: (phase) => set({ searchPhase: phase }),

  startSearching: (missionId) =>
    set({
      isSearching: true,
      searchingMissionId: missionId,
      missionStatus: 'BROADCASTED',
      searchRadiusKm: 5,
      searchStatusText: translate('searchRange5km') || "Recherche d'artisans dans un rayon de 5 km...",
      searchTimerSeconds: 60,
    }),

  updateSearchStatus: (statusText) => set({ searchStatusText: statusText }),
  updateMissionState: (partial) => {
    const isAct = Boolean(
      (partial.missionStatus && partial.missionStatus !== 'BROADCASTED' && partial.missionStatus !== 'COMPLETED') ||
      partial.activePairingProvider ||
      (partial.activeMission &&
        partial.activeMission.status !== 'BROADCASTED' &&
        partial.activeMission.status !== 'CANCELLED' &&
        partial.activeMission.status !== 'COMPLETED'),
    );
    set({
      ...partial,
      ...(isAct ? { isSearching: false } : {}),
    });
  },

  stopSearching: () =>
    set({
      isSearching: false,
    }),

  clearActiveMission: () =>
    set({
      activeMission: null,
      activePairingProvider: null,
      incomingOffer: null,
      isSearching: false,
      searchingMissionId: null,
      missionStatus: null,
      etaMinutes: 0,
      distanceKm: 0,
      providerPosition: null,
      startedAt: null,
      providerConfirmed: false,
      clientConfirmed: false,
      declaredAmount: null,
    }),
}));
