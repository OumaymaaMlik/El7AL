import React from 'react';
import { View } from 'react-native';
import { Txt } from './Txt';
import { calculatePasswordStrength } from '../utils/password';
import { useThemeStore } from '../store/useThemeStore';

const STRENGTH_COLORS = ['#f43f5e', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
const STRENGTH_LABELS = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const colors = useThemeStore((state) => state.colors);
  if (!password) return null;
  const score = calculatePasswordStrength(password);
  return (
    <View style={{ gap: 4, marginTop: -8, marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', gap: 4, height: 4 }}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={{
              flex: 1,
              backgroundColor: score >= level ? STRENGTH_COLORS[score] : colors.border,
              borderRadius: 2,
            }}
          />
        ))}
      </View>
      <Txt variant="small" style={{ color: STRENGTH_COLORS[score] }}>
        {STRENGTH_LABELS[score]}
      </Txt>
    </View>
  );
}
