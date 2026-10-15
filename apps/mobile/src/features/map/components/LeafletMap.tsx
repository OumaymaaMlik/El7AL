import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';

interface LeafletMapProps {
  lat: number;
  lng: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  style?: StyleProp<ViewStyle>;
}

export function LeafletMap({ lat, lng, onLocationSelect, style }: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null);
  // react-native-webview's component type does not resolve under this repo's React types, so it is cast once here.
  const WebViewComponent = WebView as unknown as React.ComponentType<WebViewProps & { ref?: React.Ref<WebView> }>;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
        <style>
          body { padding: 0; margin: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

          marker.on('dragend', function (e) {
            var position = marker.getLatLng();
            var msg = JSON.stringify({ lat: position.lat, lng: position.lng });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(msg);
            } else {
              window.parent.postMessage(msg, "*");
            }
          });

          map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            var msg = JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng });
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(msg);
            } else {
              window.parent.postMessage(msg, "*");
            }
          });
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    // Only the web build receives the map's messages through the window.
    if (Platform.OS !== 'web') return;
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
          if (onLocationSelect) onLocationSelect(data.lat, data.lng);
        }
      } catch (err) {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onLocationSelect]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe srcDoc={htmlContent} style={{ width: '100%', height: '100%', border: 0 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebViewComponent
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={(event: WebViewMessageEvent) => {
          if (onLocationSelect) {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
                onLocationSelect(data.lat, data.lng);
              }
            } catch (e) {}
          }
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        originWhitelist={['about:*']}
        onShouldStartLoadWithRequest={(req: { url: string }) =>
          req.url === 'about:blank' || req.url.startsWith('about:')
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // will be overridden by theme if needed
  },
});
