import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/features/auth/store/useAuthStore';
import { useLoadingStore } from '../src/shared/store/useLoadingStore';

export default function Index() {
  const { token, isLoadingSession, loadSavedSession } = useAuthStore();
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  useEffect(() => {
    loadSavedSession();
  }, [loadSavedSession]);

  useEffect(() => {
    if (isLoadingSession) {
      showLoading('Chargement', "Initialisation de l'application");
    } else {
      hideLoading();
    }
  }, [isLoadingSession, showLoading, hideLoading]);

  if (isLoadingSession) {
    return <View style={{ flex: 1, backgroundColor: '#0F5B3A' }} />;
  }

  if (token) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
