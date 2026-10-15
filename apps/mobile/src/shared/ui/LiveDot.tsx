import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export function LiveDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.ping,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 2],
              outputRange: [0.7, 0],
            }),
          },
        ]}
      />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ping: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
});
