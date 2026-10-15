import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { getPosition, useWatchPosition } from '../../hooks/useGeolocation';
import { useProviderStore } from '../../store/useProviderStore';

export const ProviderMapContainer: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ provider?: L.Marker; circle1?: L.Circle; circle2?: L.Circle }>({});

  // The artisan's real position; until the browser answers the map shows Tunis without a marker.
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const isOnline = useProviderStore((st) => st.isOnline);

  useEffect(() => {
    getPosition().then((p) => p && setPosition(p));
  }, []);
  useWatchPosition(true, setPosition, 10000);

  useEffect(() => {
    if (!mapRef.current) return;
    const currentLat = position?.lat ?? 36.8065;
    const currentLng = position?.lng ?? 10.1815;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [currentLat, currentLng],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear previous layers
    if (layersRef.current.provider) map.removeLayer(layersRef.current.provider);
    if (layersRef.current.circle1) map.removeLayer(layersRef.current.circle1);
    if (layersRef.current.circle2) map.removeLayer(layersRef.current.circle2);

    if (!position) {
      map.setView([currentLat, currentLng], 11);
      return;
    }

    // Radar Concentric Circles
    const circle1 = L.circle([currentLat, currentLng], {
      radius: 15000,
      color: '#0D5C3A',
      fillColor: '#0D5C3A',
      fillOpacity: 0.08,
      weight: 1.5,
    }).addTo(map);

    const circle2 = L.circle([currentLat, currentLng], {
      radius: 8000,
      color: '#0D5C3A',
      fillColor: '#0D5C3A',
      fillOpacity: 0.12,
      weight: 1.5,
    }).addTo(map);

    layersRef.current.circle1 = circle1;
    layersRef.current.circle2 = circle2;

    // Provider Marker (Car Icon matching Mockup)
    const providerHtmlIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="width:44px; height:44px; border-radius:50%; background:#A3E635; border:3px solid #0D5C3A; color:#0f172a; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(0,0,0,0.25);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          </div>
          <span style="background:#042416; color:#ffffff; font-size:11px; font-weight:800; padding:4px 12px; border-radius:14px; margin-top:4px; border:1px solid #0D5C3A; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
            Vous · ${isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
      `,
      iconSize: [120, 70],
      iconAnchor: [60, 50],
    });

    const providerMarker = L.marker([currentLat, currentLng], { icon: providerHtmlIcon }).addTo(map);
    layersRef.current.provider = providerMarker;

    map.setView([currentLat, currentLng], 12);
  }, [position, isOnline]);

  return (
    <div className="surface relative isolate overflow-hidden flex flex-col justify-between min-h-[380px] h-full">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full min-h-[340px] z-10" />

      {/* Bottom Footer Bar Inside Container Matching Mockup */}
      <div className="relative z-[400] px-4 py-3.5 bg-white dark:bg-dark-card border-t border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
          <MapPin className="w-4 h-4 text-brand-500 dark:text-brand-accent" />
          <span>
            {position ? (
              <span className="text-slate-600 dark:text-slate-300 font-normal">
                {position.lat.toFixed(4)} N, {position.lng.toFixed(4)} E
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-300 font-normal">Position en cours de localisation…</span>
            )}
          </span>
        </div>

        {isOnline && (
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
            <span className="pulse-dot" aria-hidden="true" />
            <span>Visible par les clients</span>
          </div>
        )}
      </div>
    </div>
  );
};
