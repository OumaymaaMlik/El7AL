import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { useLoadingStore } from '../shared/store/useLoadingStore';
import { numeralFont, wordmarkFont } from '../shared/theme/typography';

const SVG_WIDTH = 120;
const SVG_HEIGHT = 160;
const PATH_D = 'M10 10H110V34L62 150H34L86 36H10Z';

export const GlobalLoadingOverlay: React.FC = () => {
  const { isVisible, message, sub } = useLoadingStore();

  const fillAnim = useRef(new Animated.Value(0)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isVisible) {
      fillAnim.setValue(0);
      dotAnim.setValue(0);
      return;
    }

    // 1. Stylized "7" fill animation loop (1.8s)
    // Matches: 0% clip-path: 100%, 65%: 0%, 85%: 0%, 100%: fade out
    const fillLoop = Animated.loop(
      Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
    );

    // 2. Blinking dots animation loop (1.2s)
    const dotLoop = Animated.loop(
      Animated.timing(dotAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    fillLoop.start();
    dotLoop.start();

    return () => {
      fillLoop.stop();
      dotLoop.stop();
    };
  }, [isVisible, fillAnim, dotAnim]);

  if (!isVisible) return null;

  // Vertical reveal from bottom to top
  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 0.65, 0.85, 1],
    outputRange: [0, SVG_HEIGHT, SVG_HEIGHT, SVG_HEIGHT],
  });

  const fillOpacity = fillAnim.interpolate({
    inputRange: [0, 0.65, 0.85, 1],
    outputRange: [1, 1, 1, 0],
  });

  // Dot 1: Peak opacity around 40% (0.48s)
  const dot1Opacity = dotAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [0.25, 1, 0.25, 0.25],
  });

  // Dot 2: Staggered +200ms (around ~0.57)
  const dot2Opacity = dotAnim.interpolate({
    inputRange: [0, 0.17, 0.57, 0.97, 1],
    outputRange: [0.25, 0.25, 1, 0.25, 0.25],
  });

  // Dot 3: Staggered +400ms (around ~0.73)
  const dot3Opacity = dotAnim.interpolate({
    inputRange: [0, 0.33, 0.73, 1],
    outputRange: [0.25, 0.25, 1, 0.25],
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {}}
    >
      <StatusBar style="light" backgroundColor="#0F5B3A" />
      <View style={styles.container} accessibilityRole="alert" aria-busy={true}>
        {/* Animated Brand "7" Mark */}
        <View style={styles.markContainer}>
          {/* Base Inactive Layer */}
          <Svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            style={StyleSheet.absoluteFill}
          >
            <Path d={PATH_D} fill="#0A4A2E" stroke="#0A4A2E" strokeWidth={8} strokeLinejoin="round" />
          </Svg>

          {/* Animated Lime Fill Layer (reveals bottom-to-top) */}
          <Animated.View
            style={[
              styles.limeFillWrapper,
              {
                height: fillHeight,
                opacity: fillOpacity,
              },
            ]}
          >
            <Svg
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              style={styles.limeSvg}
            >
              <Path d={PATH_D} fill="#B4EB3B" stroke="#B4EB3B" strokeWidth={8} strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>
          El <Text style={styles.brandAccent}>7</Text>al
        </Text>

        {/* Action Message + Dynamic Subtitle */}
        <View style={styles.textContainer}>
          <View style={styles.messageRow}>
            <Text style={styles.messageText}>{message}</Text>
            <View style={styles.dotsRow}>
              <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
              <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
              <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
            </View>
          </View>
          <Text style={styles.subText}>{sub}</Text>
        </View>

        {/* Bottom 24/7 Emergency Badge */}
        <View style={styles.bottomBadge}>
          <View style={styles.badgeSquare} />
          <Text style={styles.badgeText}>DÉPANNAGE D'URGENCE 24/7</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F5B3A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  markContainer: {
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  limeFillWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SVG_WIDTH,
    overflow: 'hidden',
  },
  limeSvg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  brandTitle: {
    marginTop: 28,
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: wordmarkFont,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#B4EB3B',
    fontFamily: numeralFont,
  },
  textContainer: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B4EB3B',
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#CFE5D7',
    textAlign: 'center',
  },
  bottomBadge: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 52 : 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  badgeSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#B4EB3B',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#CFE5D7',
  },
});
