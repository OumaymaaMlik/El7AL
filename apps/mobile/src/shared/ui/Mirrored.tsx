import React from 'react';
import { View } from 'react-native';
import { useIsRTL } from '../store/useLanguageStore';

/**
 * Mirrors its child in right-to-left layouts. Wrap icons that point in a
 * direction (back arrows, chevrons, "send") so they follow the reading direction.
 */
export function Mirrored({ children }: { children: React.ReactNode }) {
  const isRTL = useIsRTL();
  return <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>{children}</View>;
}
