/**
 * The page rendered inside the live tracking map (a WebView on devices, an iframe on web).
 *
 * It receives updates through `window.__update(json)` (native: injected script; web: postMessage) so
 * the map and tiles are loaded once and only the markers move.
 *
 * Update payload: { pickup?: {lat,lng}, provider?: {lat,lng}, labels?: {pickup, provider} }
 * Route geometry comes from the public OSRM demo server; if it is unreachable a straight dashed
 * line is drawn instead. For production traffic, point ROUTING_URL at your own OSRM/Valhalla or a
 * paid routing provider and use a commercial tile provider instead of the OSM community tiles.
 */
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving';

export function buildLiveMapHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #E9EEEA; }
    .pin { width: 18px; height: 18px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 1px 6px rgba(0,0,0,.45); }
    .pin.provider { background: #0F5B3A; }
    .pin.provider::after { content: ''; position: absolute; inset: -9px; border-radius: 50%; background: rgba(15,91,58,.22); animation: pulse 1.8s ease-out infinite; z-index: -1; }
    .pin.pickup { background: #A3E635; border-color: #0E1F16; }
    @keyframes pulse { 0% { transform: scale(.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var ROUTING_URL = ${JSON.stringify(ROUTING_URL)};
    var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([36.8, 10.18], 13);
    L.tileLayer(${JSON.stringify(TILE_URL)}, { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    function icon(kind) {
      return L.divIcon({ className: '', html: '<div class="pin ' + kind + '"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
    }
    var pickupMarker = null, providerMarker = null, routeLine = null, straightLine = null;
    var lastRouteKey = '', lastRouteAt = 0, userMoved = false, fitted = false;
    map.on('dragstart zoomstart', function (e) { if (fitted) userMoved = true; });

    function valid(p) { return p && isFinite(p.lat) && isFinite(p.lng); }

    function fit() {
      var points = [];
      if (pickupMarker) points.push(pickupMarker.getLatLng());
      if (providerMarker) points.push(providerMarker.getLatLng());
      if (points.length === 1) map.setView(points[0], 15);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 16 });
      fitted = true;
    }

    function drawRoute(from, to) {
      if (straightLine) { map.removeLayer(straightLine); straightLine = null; }
      straightLine = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], { color: '#0F5B3A', weight: 3, dashArray: '6 8', opacity: 0.7 }).addTo(map);

      var key = from.lat.toFixed(3) + ',' + from.lng.toFixed(3) + '>' + to.lat.toFixed(4) + ',' + to.lng.toFixed(4);
      if (key === lastRouteKey || Date.now() - lastRouteAt < 15000) return;
      lastRouteKey = key; lastRouteAt = Date.now();
      var url = ROUTING_URL + '/' + from.lng + ',' + from.lat + ';' + to.lng + ',' + to.lat + '?overview=full&geometries=geojson';
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        var route = data && data.routes && data.routes[0];
        if (!route) return;
        var coords = route.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
        if (routeLine) map.removeLayer(routeLine);
        routeLine = L.polyline(coords, { color: '#0F5B3A', weight: 5, opacity: 0.9 }).addTo(map);
        if (straightLine) { map.removeLayer(straightLine); straightLine = null; }
      }).catch(function () {});
    }

    window.__update = function (raw) {
      var data;
      try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
      if (!data || data.type !== 'update') return;

      if (valid(data.pickup)) {
        if (!pickupMarker) pickupMarker = L.marker([data.pickup.lat, data.pickup.lng], { icon: icon('pickup'), keyboard: false }).addTo(map);
        else pickupMarker.setLatLng([data.pickup.lat, data.pickup.lng]);
      }
      if (valid(data.provider)) {
        if (!providerMarker) providerMarker = L.marker([data.provider.lat, data.provider.lng], { icon: icon('provider'), keyboard: false, zIndexOffset: 500 }).addTo(map);
        else providerMarker.setLatLng([data.provider.lat, data.provider.lng]);
      }
      if (pickupMarker && providerMarker) drawRoute(providerMarker.getLatLng(), pickupMarker.getLatLng());
      if (!fitted || !userMoved) fit();
    };

    window.addEventListener('message', function (e) { window.__update(e.data); });
    document.addEventListener('message', function (e) { window.__update(e.data); });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage('ready');
    else if (window.parent !== window) window.parent.postMessage('ready', '*');
  </script>
</body>
</html>`;
}
