import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMissionStore } from '../../missions';
import { useNotificationStore } from '../store/useNotificationStore';

const SLIDE_DISTANCE = 20; // calm slide from the top
const AUTO_DISMISS_MS = 4000;
const ENTER_DURATION = 250;
const EXIT_DURATION = 200;

/**
 * Behaviour of the in-app toast: slide in/out (respecting reduced motion), auto-dismiss that
 * pauses while touched, swipe-up to dismiss, and tap to open what the notification is about.
 */
export function useToastController() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeToast = useNotificationStore((state) => state.activeToast);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const restingY = Math.max(insets.top, 12) + 6;
  const translateY = useRef(new Animated.Value(restingY - SLIDE_DISTANCE)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check accessibility reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub?.remove?.();
  }, []);

  // Timer controls: Pause when user touches, resume when released
  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    clearDismissTimer();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      ...(!reduceMotion
        ? [
            Animated.timing(translateY, {
              toValue: restingY - 18,
              duration: EXIT_DURATION,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]
        : []),
    ]).start(() => {
      dismissToast();
    });
  }, [clearDismissTimer, dismissToast, reduceMotion, restingY, translateY, opacity]);

  const startDismissTimer = useCallback(() => {
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);
  }, [clearDismissTimer, handleDismiss]);

  // Entrance & toast replacement handling
  const toastId = activeToast?.id;
  useEffect(() => {
    if (toastId) {
      setAvatarFailed(false);
      clearDismissTimer();

      if (reduceMotion) {
        translateY.setValue(restingY);
      } else {
        translateY.setValue(restingY - SLIDE_DISTANCE);
      }
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTER_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        ...(!reduceMotion
          ? [
              Animated.timing(translateY, {
                toValue: restingY,
                duration: ENTER_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]
          : []),
      ]).start();

      startDismissTimer();

      return () => clearDismissTimer();
    }
  }, [toastId, restingY, reduceMotion, startDismissTimer, clearDismissTimer, opacity, translateY]);

  const handlePressToast = useCallback(() => {
    if (!activeToast) return;
    clearDismissTimer();
    dismissToast();

    if (activeToast.type === 'CHAT') {
      const missionId = activeToast.metadata?.missionId;
      if (missionId) {
        router.push({ pathname: '/(tabs)/chat', params: { missionId } });
      } else {
        router.push('/(tabs)/chat');
      }
    } else if (activeToast.type === 'ACCEPT') {
      router.push('/(tabs)/tracking');
    } else if (activeToast.type === 'OFFER') {
      router.push('/(tabs)/home');
    } else if (activeToast.type === 'COMPLETED' && activeToast.metadata?.reviewData) {
      useMissionStore.getState().setReviewData(activeToast.metadata.reviewData);
      router.push('/(tabs)/home');
    }
  }, [activeToast, clearDismissTimer, dismissToast, router]);

  // PanResponder for swipe-up dismiss and pausing timer while touching
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        clearDismissTimer();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) {
          // Follow swipe upwards smoothly
          translateY.setValue(restingY + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -16 || gesture.vy < -0.28) {
          // Swipe up threshold met -> Dismiss immediately
          handleDismiss();
        } else if (Math.abs(gesture.dy) < 5 && Math.abs(gesture.dx) < 5) {
          // Tap detected -> Open conversation
          handlePressToast();
        } else {
          // Snap back to resting position and restart 4s timer
          Animated.timing(translateY, {
            toValue: restingY,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
          startDismissTimer();
        }
      },
      onPanResponderTerminate: () => {
        startDismissTimer();
      },
    }),
  ).current;

  return {
    activeToast,
    opacity,
    translateY,
    panHandlers: panResponder.panHandlers,
    dismiss: handleDismiss,
    avatarFailed,
    setAvatarFailed,
  };
}
