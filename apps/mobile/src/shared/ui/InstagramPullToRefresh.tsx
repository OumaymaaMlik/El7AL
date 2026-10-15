import React, { useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollViewProps,
  Platform,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeStore } from '../store/useThemeStore';

interface InstagramPullToRefreshProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => Promise<void> | void;
  headerComponent?: React.ReactNode;
  children: React.ReactNode;
}

/** The parts of a touch or mouse event this component reads (web only). */
interface PointerLike {
  touches?: { pageY: number }[];
  pageY?: number;
  buttons?: number;
}

const pageYOf = (e: PointerLike): number => (e.touches ? e.touches[0].pageY : (e.pageY ?? 0));

export function InstagramPullToRefresh({
  refreshing,
  onRefresh,
  headerComponent,
  children,
  style,
  contentContainerStyle,
  ...rest
}: InstagramPullToRefreshProps) {
  const colors = useThemeStore((state) => state.colors);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  // 1/5th of the window page height (~140px - 160px)
  const windowHeight = Dimensions.get('window').height || 800;
  const ONE_FIFTH_HEIGHT = Math.round(windowHeight * 0.2);

  const activeHeight = refreshing ? ONE_FIFTH_HEIGHT : isPulling ? pullDistance : 0;
  const opacityVal = refreshing ? 1 : Math.min(pullDistance / (ONE_FIFTH_HEIGHT * 0.5), 1);

  const handleTouchStart = (e: PointerLike) => {
    if (Platform.OS !== 'web') return;
    startYRef.current = pageYOf(e);
  };

  const handleTouchMove = (e: PointerLike) => {
    if (Platform.OS !== 'web') return;
    if (scrollOffsetRef.current > 5) return;

    const pageY = pageYOf(e);
    const diff = pageY - startYRef.current;

    if (diff > 0) {
      const distance = Math.min(diff * 0.65, ONE_FIFTH_HEIGHT);
      setPullDistance(distance);
      setIsPulling(true);
    }
  };

  const handleTouchEnd = async () => {
    if (Platform.OS !== 'web') return;
    if (pullDistance > ONE_FIFTH_HEIGHT * 0.4 && !refreshing) {
      setIsPulling(false);
      setPullDistance(0);
      await onRefresh();
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      {/* 1. Top Nav Header Bar (Stays pinned at top) */}
      {headerComponent && <View style={{ backgroundColor: colors.background, zIndex: 10 }}>{headerComponent}</View>}

      {/* 2. Expanding Refresh Bar: 1/5th Page Height (Under top nav bar & above main content) */}
      <View
        style={[
          styles.refreshHeaderBar,
          {
            height: activeHeight,
            opacity: opacityVal,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>

      {/* 3. Main Page Content ScrollView */}
      <KeyboardAwareScrollView
        {...rest}
        style={style}
        contentContainerStyle={contentContainerStyle}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardOpeningTime={0}
        onScroll={(e) => {
          scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          rest.onScroll?.(e);
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        {...({
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
          onMouseDown: handleTouchStart,
          onMouseMove: (e: PointerLike) => {
            if (e.buttons === 1) handleTouchMove(e);
          },
          onMouseUp: handleTouchEnd,
        } as object)}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  refreshHeaderBar: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spinnerWrapper: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
