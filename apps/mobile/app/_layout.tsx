import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '../src/shared/store/useThemeStore';
import { useLanguageStore } from '../src/shared/store/useLanguageStore';
import { useAuthStore } from '../src/features/auth/store/useAuthStore';
import { GlobalSocketListener } from '../src/providers/GlobalSocketListener';
import { ProviderLocationSharing } from '../src/providers/ProviderLocationSharing';
import { NotificationToast } from '../src/features/notifications/components/NotificationToast';
import { GlobalLoadingOverlay } from '../src/providers/GlobalLoadingOverlay';
import { IncomingOfferModal } from '../src/features/missions/components/IncomingOfferModal';
import { ProviderTermsGate } from '../src/features/wallet/components/ProviderTermsGate';
import { FONT_ASSETS } from '../src/shared/theme/typography';
import { initMonitoring, withMonitoring } from '../src/services/monitoring';

import { registerForPushNotificationsAsync } from '../src/features/notifications/services/pushNotifications';

initMonitoring();

const queryClient = new QueryClient();

/** Screens that slide in over the previous one on the web. Welcome is the first screen and does not slide. */
const SLIDING_ROUTES = new Set(['(auth)/login', '(auth)/register', '(auth)/forgot-password']);

function RootLayout() {
  const { mode, colors, loadSavedTheme } = useThemeStore();
  const loadSavedLanguage = useLanguageStore((state) => state.loadSavedLanguage);
  const loadSavedSession = useAuthStore((state) => state.loadSavedSession);

  // Brand typefaces. If loading fails the app still starts, with the system font.
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    loadSavedTheme();
    loadSavedLanguage();
    loadSavedSession();
    registerForPushNotificationsAsync();
  }, [loadSavedTheme, loadSavedLanguage, loadSavedSession]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
        <GlobalSocketListener />
        <ProviderLocationSharing />
        <IncomingOfferModal />
        <ProviderTermsGate />
        <NotificationToast />
        <GlobalLoadingOverlay />
        <Stack
          screenOptions={({ route }) => {
            // On the web a stack hides the screen underneath as soon as a new one opens, which shows a blank page
            // until the slide ends. A transparent presentation keeps the old page visible, and the container must
            // be transparent too (SlideScreen paints its own background) or it would cover the old page.
            const slidesOver = Platform.OS === 'web' && SLIDING_ROUTES.has(route.name);
            return {
              headerShown: false,
              // Phones slide screens in from the right; the web does it in SlideScreen.
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: slidesOver ? 'transparent' : colors.background },
              ...(slidesOver ? { presentation: 'transparentModal' as const } : null),
            };
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default withMonitoring(RootLayout);
