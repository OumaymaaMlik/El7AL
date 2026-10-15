import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

interface AddressFieldProps {
  label: string;
  value: string;
  onChange: (address: string) => void;
  /** The picked point, when there is one. */
  lat?: number | null;
  lng?: number | null;
  /** Called with the new point when the map is clicked, the marker dragged, or the GPS button used. */
  onCoordinates?: (lat: number, lng: number) => void;
  onError?: (message: string) => void;
  placeholder?: string;
}

/** Tunis, used until a point is known. */
const DEFAULT_CENTER: [number, number] = [36.8065, 10.1815];

const MARKER = L.divIcon({
  className: '',
  html: '<div style="width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:#A3E635;border:4px solid #0D5C3A;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [0, 0],
});

/** "Street, area, city" for a point, or the coordinates when the lookup fails. */
async function addressOf(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );
    const data = await response.json();
    if (data && data.display_name) {
      const parts: string[] = [];
      if (data.address?.road) parts.push(data.address.road);
      if (data.address?.suburb || data.address?.neighbourhood)
        parts.push(data.address.suburb || data.address.neighbourhood);
      if (data.address?.city || data.address?.town || data.address?.state)
        parts.push(data.address.city || data.address.town || data.address.state);
      return parts.length > 0 ? parts.join(', ') : String(data.display_name).split(',').slice(0, 3).join(',');
    }
  } catch {
    /* fall through */
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * The address input shared by the client and the artisan profile. The text field is filled by picking a point
 * on the map (click, or drag the marker) or with the GPS button; it can still be typed by hand.
 */
export const AddressField: React.FC<AddressFieldProps> = ({
  label,
  value,
  onChange,
  lat,
  lng,
  onCoordinates,
  onError,
  placeholder = 'ex: Tunis, Avenue Habib Bourguiba',
}) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  /** Moves the pin; set once the map exists so a point coming from outside can use it. */
  const placePin = useRef<((lat: number, lng: number) => void) | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Keep the latest callbacks without rebuilding the map.
  const callbacks = useRef({ onChange, onCoordinates });
  callbacks.current = { onChange, onCoordinates };

  const pick = useCallback(async (la: number, ln: number) => {
    callbacks.current.onCoordinates?.(la, ln);
    setIsLookingUp(true);
    const text = await addressOf(la, ln);
    setIsLookingUp(false);
    callbacks.current.onChange(text);
  }, []);

  useEffect(() => {
    if (!mapEl.current || map.current) return;
    const start: [number, number] = typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : DEFAULT_CENTER;
    const m = L.map(mapEl.current, { center: start, zoom: typeof lat === 'number' ? 16 : 12, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(m);
    map.current = m;

    const place = (la: number, ln: number) => {
      if (!marker.current) {
        marker.current = L.marker([la, ln], { icon: MARKER, draggable: true, keyboard: false }).addTo(m);
        marker.current.on('dragend', () => {
          const p = marker.current!.getLatLng();
          void pick(p.lat, p.lng);
        });
      } else {
        marker.current.setLatLng([la, ln]);
      }
    };
    if (typeof lat === 'number' && typeof lng === 'number') place(lat, lng);

    m.on('click', (e: L.LeafletMouseEvent) => {
      place(e.latlng.lat, e.latlng.lng);
      void pick(e.latlng.lat, e.latlng.lng);
    });
    placePin.current = place;

    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A point set from outside (profile loaded, GPS) moves the marker and the view.
  useEffect(() => {
    const m = map.current;
    if (!m || typeof lat !== 'number' || typeof lng !== 'number') return;
    placePin.current?.(lat, lng);
    m.setView([lat, lng], Math.max(m.getZoom(), 16));
  }, [lat, lng]);

  const detect = () => {
    if (!navigator.geolocation) {
      onError?.("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await pick(pos.coords.latitude, pos.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        onError?.('Impossible de récupérer la position GPS.');
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-brand-500 dark:text-brand-accent">
          <MapPin className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          placeholder={placeholder}
          className="w-full ps-10 pe-12 py-3 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:focus:ring-brand-accent transition-all"
        />
        <button
          type="button"
          onClick={detect}
          disabled={isLocating}
          title="Détecter ma position GPS"
          aria-label="Détecter ma position GPS"
          className="absolute end-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-500 dark:text-brand-accent hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-white/15 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      <div className="relative isolate rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div
          ref={mapEl}
          className="h-[260px] w-full isolate z-0"
          aria-label="Carte : cliquez ou déplacez le repère pour choisir l'adresse"
        />
        {isLookingUp && (
          <span
            role="status"
            className="absolute bottom-2 start-2 z-[500] rounded-full bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold shadow"
          >
            Recherche de l'adresse…
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Cliquez sur la carte ou déplacez le repère : l'adresse se remplit toute seule.
      </p>
    </div>
  );
};
