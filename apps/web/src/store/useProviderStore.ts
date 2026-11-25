import { create } from 'zustand';
import { api, apiErrorMessage } from '../services/api';
import { getPosition } from '../hooks/useGeolocation';

export interface WalletChargeLine {
  id: string;
  createdAt: string;
  commission: number;
  activation: number;
  categoryName: string | null;
}

export interface TransferLine {
  id: string;
  createdAt: string;
  amount: number | string;
  receivedAmount?: number | string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface ProviderPresence {
  /** Whether the artisan is online (receives offers). Mirrors the server. */
  isOnline: boolean;
  isLoaded: boolean;
  isBusy: boolean;
  /** Identity check by an admin: only ACTIVE artisans can go online. */
  accountStatus: string | null;
  /** Why the check was refused (shown to the artisan). */
  verificationNote: string | null;
  /** The artisan's own profile figures, for the dashboard. */
  ratingAverage: number | null;
  totalRatings: number;
  /** What the artisan owes El 7al (commission, plus once the activation fee). Above 0 the artisan is blocked. */
  due: number;
  /** Stopped by an overdue amount. */
  blocked: boolean;
  /** This week's jobs and the date (Monday 00:00 in Tunisia) by which they must be paid. */
  jobsDueLater: number;
  nextDueAt: string | null;
  /** The cash collected from clients since Monday (unknown until loaded), and the jobs finished in that time. */
  earnedThisWeek: number | null;
  jobsThisWeek: number;
  /** El 7al's bank account, from the server. */
  rib: string | null;
  /** Where the newest transfer receipt stands. */
  transfer: 'none' | 'pending' | 'approved' | 'refused';
  /** What each finished job cost, and every transfer sent. */
  charges: WalletChargeLine[];
  transfers: TransferLine[];
  /** Whether the current fees were accepted (kept by the server); unknown until loaded. */
  termsAccepted: boolean | null;
  acceptTerms: () => Promise<void>;
  load: () => Promise<void>;
  /** An admin decided: reflect it at once without waiting for a reload. */
  applyVerification: (status: string, note: string | null) => void;
  /** Goes online/offline. Going online needs the browser position so offers can be matched. Returns an error message or null. */
  setOnline: (online: boolean) => Promise<string | null>;
}

export const useProviderStore = create<ProviderPresence>((set, get) => ({
  isOnline: false,
  isLoaded: false,
  isBusy: false,
  accountStatus: null,
  verificationNote: null,
  ratingAverage: null,
  totalRatings: 0,
  due: 0,
  blocked: false,
  jobsDueLater: 0,
  nextDueAt: null,
  earnedThisWeek: null,
  jobsThisWeek: 0,
  rib: null,
  transfer: 'none',
  charges: [],
  transfers: [],
  termsAccepted: null,

  acceptTerms: async () => {
    await api.post('/wallet/accept-terms', {});
    set({ termsAccepted: true });
  },

  load: async () => {
    // The wallet is read apart: a failure there must not hide the rest of the dashboard.
    try {
      const wallet = (await api.get('/wallet/transactions')).data?.data;
      const status = wallet?.transactions?.[0]?.status;
      set({
        due: Number(wallet?.due) || 0,
        blocked: Boolean(wallet?.blocked),
        jobsDueLater: Number(wallet?.jobsDueLater) || 0,
        earnedThisWeek: Number(wallet?.earnedThisWeek) || 0,
        jobsThisWeek: Number(wallet?.jobsThisWeek) || 0,
        nextDueAt: wallet?.nextDueAt ?? null,
        charges: wallet?.charges ?? [],
        transfers: wallet?.transactions ?? [],
        termsAccepted: wallet?.termsAccepted ?? null,
        rib: wallet?.rib ?? null,
        transfer:
          status === 'PENDING'
            ? 'pending'
            : status === 'REJECTED'
              ? 'refused'
              : status === 'APPROVED'
                ? 'approved'
                : 'none',
      });
    } catch {
      // keep what was known
    }
    try {
      const res = await api.get('/auth/me');
      const profile = res.data?.data?.providerProfile;
      if (profile) {
        set({
          accountStatus: res.data?.data?.status ?? null,
          verificationNote: profile.verificationNote ?? null,
          isOnline: Boolean(profile.isAvailable),
          ratingAverage: typeof profile.ratingAverage === 'number' ? profile.ratingAverage : null,
          totalRatings: profile.totalRatings ?? 0,
          isLoaded: true,
        });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  applyVerification: (status, note) =>
    set(
      status === 'ACTIVE'
        ? { accountStatus: status, verificationNote: null }
        : { accountStatus: status, verificationNote: note, isOnline: false },
    ),

  setOnline: async (online) => {
    if (get().isBusy) return null;
    set({ isBusy: true });
    try {
      if (online) {
        const position = await getPosition();
        if (!position) return 'Activez la localisation du navigateur pour recevoir des demandes près de vous.';
        await api.put('/geo/provider/availability', {
          isAvailable: true,
          currentLat: position.lat,
          currentLng: position.lng,
        });
      } else {
        await api.put('/geo/provider/availability', { isAvailable: false });
      }
      set({ isOnline: online });
      return null;
    } catch (err) {
      return apiErrorMessage(err, 'Impossible de changer votre disponibilité.');
    } finally {
      set({ isBusy: false });
    }
  },
}));
