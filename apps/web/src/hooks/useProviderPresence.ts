import { useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useProviderStore } from '../store/useProviderStore';
import { useWatchPosition } from './useGeolocation';

/**
 * Keeps the artisan's real position on the server while they are online, so offers reach them.
 * Mounted once in the provider layout. Also loads their online state when the app opens.
 */
export function useProviderPresence() {
  const isProvider = useAuthStore((s) => s.user?.role === 'PROVIDER');
  const isOnline = useProviderStore((s) => s.isOnline);
  const load = useProviderStore((s) => s.load);

  useEffect(() => {
    if (isProvider) load();
  }, [isProvider, load]);

  useWatchPosition(
    isProvider && isOnline,
    (p) => {
      api.put('/geo/provider/location', { lat: p.lat, lng: p.lng }).catch(() => undefined);
    },
    20000,
  );
}
