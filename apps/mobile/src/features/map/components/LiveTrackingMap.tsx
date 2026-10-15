import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { WebView, type WebViewProps } from 'react-native-webview';
import { Navigation } from 'lucide-react-native';
import { radius, space } from '../../../shared/theme/tokens';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import type { Coords } from '../services/location';
import { buildLiveMapHtml } from '../utils/liveMapHtml';

interface Props {
  /** Where the artisan is going (the client's pickup point). */
  pickup?: Coords | null;
  /** The artisan's latest position; the marker moves as it changes. */
  provider?: Coords | null;
  /** When set, a button opens the turn-by-turn navigation sheet (artisan only). */
  onOpenNavigation?: () => void;
  height?: number;
}

/**
 * A real map (OpenStreetMap tiles via Leaflet) showing the pickup point, the artisan's live
 * position and the road route between them. The page loads once; positions are pushed in.
 */
// react-native-webview's component type does not resolve under this repo's React types, so it is cast once here.
const WebViewComponent = WebView as unknown as React.ComponentType<
  WebViewProps & { ref?: React.Ref<{ injectJavaScript: (script: string) => void }> }
>;

export function LiveTrackingMap({ pickup, provider, onOpenNavigation, height = 240 }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const html = useMemo(buildLiveMapHtml, []);
  const webViewRef = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ready = useRef(false);
  const latest = useRef<string>('');

  const message = useMemo(() => JSON.stringify({ type: 'update', pickup, provider }), [pickup, provider]);

  const push = useCallback((payload: string) => {
    if (!payload || !ready.current) return;
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
    } else {
      webViewRef.current?.injectJavaScript(`window.__update(${JSON.stringify(payload)}); true;`);
    }
  }, []);

  useEffect(() => {
    latest.current = message;
    push(message);
  }, [message, push]);

  const onReady = useCallback(() => {
    ready.current = true;
    push(latest.current);
  }, [push]);

  // Web: the iframe tells us when its page is ready.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (event: MessageEvent) => {
      if (event.source === iframeRef.current?.contentWindow && event.data === 'ready') onReady();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onReady]);

  const border = { borderColor: colors.border, backgroundColor: colors.surface };

  return (
    <View style={[styles.container, border, { height }]} accessibilityLabel={t('viewRoute')}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef as React.RefObject<HTMLIFrameElement>}
          srcDoc={html}
          title="Live tracking"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <WebViewComponent
          ref={webViewRef}
          source={{ html }}
          originWhitelist={['*']}
          javaScriptEnabled
          scrollEnabled={false}
          onMessage={(event: { nativeEvent: { data: string } }) => event.nativeEvent.data === 'ready' && onReady()}
          style={styles.fill}
        />
      )}

      {onOpenNavigation && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('viewRoute')}
          onPress={onOpenNavigation}
          style={({ pressed }) => [styles.navButton, { backgroundColor: colors.brand }, pressed && { opacity: 0.85 }]}
        >
          <Navigation size={16} color={colors.onBrand} />
          <Txt variant="smallStrong" color={colors.onBrand}>
            {t('viewRoute')}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  fill: { flex: 1 },
  navButton: {
    position: 'absolute',
    left: space.md,
    top: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    height: 36,
    borderRadius: radius.sm,
  },
});
