import { api } from '../../../services/http/client';
import type { Coords } from '../services/location';

/** Publishes the artisan's position so clients nearby can be matched with them. */
export async function updateProviderLocation(coords: Coords) {
  await api.put('/geo/provider/location', { lat: coords.lat, lng: coords.lng });
}
