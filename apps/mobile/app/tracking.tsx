import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function TrackingRedirect() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: '/(tabs)/tracking', params }} />;
}
