import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck } from 'lucide-react';

interface RealLeafletMapProps {
  clientLat: number | null;
  clientLng: number | null;
  addressText: string;
  providerLat?: number | null;
  providerLng?: number | null;
  providerName?: string;
  etaMinutes?: number | null;
  distanceKm?: number | null;
  radiusKm?: number;
}

export const RealLeafletMap: React.FC<RealLeafletMapProps> = ({
  clientLat,
  clientLng,
  addressText,
  providerLat,
  providerLng,
  providerName,
  etaMinutes,
  radiusKm = 15,
}) => {
  const safeClientLat =
    clientLat !== null && clientLat !== undefined && !isNaN(Number(clientLat)) ? Number(clientLat) : 36.8065;
  const safeClientLng =
    clientLng !== null && clientLng !== undefined && !isNaN(Number(clientLng)) ? Number(clientLng) : 10.1815;
  const safeProviderLat =
    providerLat !== null && providerLat !== undefined && !isNaN(Number(providerLat)) ? Number(providerLat) : null;
  const safeProviderLng =
    providerLng !== null && providerLng !== undefined && !isNaN(Number(providerLng)) ? Number(providerLng) : null;

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    client?: L.Marker;
    provider?: L.Marker;
    polyline?: L.Polyline;
    circle1?: L.Circle;
    circle2?: L.Circle;
  }>({});

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [safeClientLat, safeClientLng],
        zoom: 13,
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

    // Remove old layers
    if (layersRef.current.client) map.removeLayer(layersRef.current.client);
    if (layersRef.current.provider) map.removeLayer(layersRef.current.provider);
    if (layersRef.current.polyline) map.removeLayer(layersRef.current.polyline);
    if (layersRef.current.circle1) map.removeLayer(layersRef.current.circle1);
    if (layersRef.current.circle2) map.removeLayer(layersRef.current.circle2);

    // Client Marker
    const clientHtmlIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="width:42px; height:42px; border-radius:14px; background:#0D5C3A; border:3px solid #22C55E; color:#ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span style="background:#ffffff; color:#0f172a; font-size:11px; font-weight:800; padding:3px 10px; border-radius:12px; margin-top:4px; border:1px solid #e2e8f0; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            Votre position
          </span>
        </div>
      `,
      iconSize: [42, 65],
      iconAnchor: [21, 55],
    });

    const clientMarker = L.marker([safeClientLat, safeClientLng], { icon: clientHtmlIcon }).addTo(map);
    layersRef.current.client = clientMarker;

    if (safeProviderLat !== null && safeProviderLng !== null) {
      // Provider Marker (Car Icon)
      const providerHtmlIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <span style="background:#042416; color:#A3E635; font-size:11px; font-weight:900; padding:4px 10px; border-radius:12px; margin-bottom:4px; white-space:nowrap; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:1px solid #0D5C3A;">
              ${providerName || 'Artisan'} - ${etaMinutes !== null && etaMinutes !== undefined ? etaMinutes : 12} min
            </span>
            <div style="width:44px; height:44px; border-radius:50%; background:#22C55E; border:3px solid #ffffff; color:#ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 25px rgba(0,0,0,0.3);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [120, 70],
        iconAnchor: [60, 65],
      });

      const providerMarker = L.marker([safeProviderLat!, safeProviderLng!], { icon: providerHtmlIcon }).addTo(map);
      layersRef.current.provider = providerMarker;

      // Draw polyline connecting client and provider
      const polyline = L.polyline(
        [
          [safeClientLat, safeClientLng],
          [safeProviderLat!, safeProviderLng!],
        ],
        { color: '#0D5C3A', weight: 4, opacity: 0.9 },
      ).addTo(map);
      layersRef.current.polyline = polyline;

      const bounds = L.latLngBounds([
        [safeClientLat, safeClientLng],
        [safeProviderLat!, safeProviderLng!],
      ]);
      map.fitBounds(bounds, { padding: [70, 70] });
    } else {
      // Draw Search Radius Circles matching Mockup State 1
      const circle1 = L.circle([safeClientLat, safeClientLng], {
        radius: (radiusKm || 15) * 1000,
        color: '#0D5C3A',
        fillColor: '#0D5C3A',
        fillOpacity: 0.08,
        weight: 1.5,
      }).addTo(map);

      const circle2 = L.circle([safeClientLat, safeClientLng], {
        radius: (radiusKm || 15) * 1000 * 0.6,
        color: '#0D5C3A',
        fillColor: '#0D5C3A',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);

      layersRef.current.circle1 = circle1;
      layersRef.current.circle2 = circle2;

      map.setView([safeClientLat, safeClientLng], 12);
    }
  }, [safeClientLat, safeClientLng, safeProviderLat, safeProviderLng, providerName, etaMinutes, radiusKm]);

  return (
    <div className="relative isolate overflow-hidden rounded-tile border border-slate-200 dark:border-slate-800 bg-slate-900 text-white min-h-[380px] flex flex-col justify-between">
      {/* Top Floating Overlay Badge */}
      <div className="absolute top-4 start-4 z-[400] pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{safeProviderLat ? "Position de l'artisan en direct" : 'GPS synchronisé en direct'}</span>
        </div>
      </div>

      {/* Real Interactive Leaflet Container */}
      <div ref={mapRef} className="w-full h-[380px] z-10" />

      {/* Bottom Info Bar Overlay */}
      <div className="relative z-[400] px-4 py-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="truncate max-w-sm">
          {addressText}{' '}
          <span className="text-slate-500 dark:text-slate-400">
            ({safeClientLat.toFixed(4)} N, {safeClientLng.toFixed(4)} E)
          </span>
        </span>
        <span className="text-brand-500 dark:text-brand-accent font-extrabold flex items-center gap-1 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sécurisé El 7al
        </span>
      </div>
    </div>
  );
};
