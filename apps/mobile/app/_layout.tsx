import React, { useEffect } from 'react';
import { View } from 'react-native';
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
import { FONT_ASSETS } from '../src/shared/theme/typography';

import { registerForPushNotificationsAsync } from '../src/features/notifications/services/pushNotifications';

const queryClient = new QueryClient();

export default function RootLayout() {
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
        <StatusBar
          style={mode === 'dark' ? 'light' : 'dark'}
          backgroundColor={colors.background}
        />
        <GlobalSocketListener />
        <ProviderLocationSharing />
        <IncomingOfferModal />
        <NotificationToast />
        <GlobalLoadingOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
