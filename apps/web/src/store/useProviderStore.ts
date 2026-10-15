import { create } from 'zustand';
import { api, apiErrorMessage } from '../services/api';
import { getPosition } from '../hooks/useGeolocation';

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

  load: async () => {
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
