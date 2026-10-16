import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../store/useThemeStore';
import { wordmarkFont } from '../theme/typography';

/** The El 7al logo: the 7 and the name. It is always Latin, whatever the app language. */
export function BrandMark() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="El 7al" style={styles.row}>
      <Svg width={22} height={30} viewBox="0 0 22 30">
        <Path d="M1 1h20v5.5L11.5 29H4.5l9-21.5H1z" fill={colors.logo} />
      </Svg>
      <Text style={[styles.name, { color: colors.accentText }]}>El 7al</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontFamily: wordmarkFont, fontSize: 23, lineHeight: 28, letterSpacing: -0.6 },
});
