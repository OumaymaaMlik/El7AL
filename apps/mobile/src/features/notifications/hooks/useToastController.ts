import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMissionStore } from '../../missions';
import { useNotificationStore, type NotificationItem } from '../store/useNotificationStore';
import { useReducedMotion } from '../../../shared/ui/useReducedMotion';

const SLIDE_DISTANCE = 20; // calm slide from the top
const AUTO_DISMISS_MS = 4000;
const ENTER_DURATION = 250;
const EXIT_DURATION = 200;

/** Opens what a pop-up is about: a message opens its conversation, news about a job opens the job. */
function openToastTarget(toast: NotificationItem, router: ReturnType<typeof useRouter>) {
  const missionId = toast.metadata?.missionId;
  if (toast.type === 'CHAT') {
    router.push(missionId ? { pathname: '/(tabs)/chat', params: { missionId } } : '/(tabs)/chat');
    return;
  }
  if (toast.type === 'COMPLETED' && toast.metadata?.reviewData) {
    useMissionStore.getState().setReviewData(toast.metadata.reviewData);
    router.push('/(tabs)/home');
    return;
  }
  if (toast.metadata?.opensPayments) router.push('/pay');
  else if (toast.type === 'OFFER') router.push('/(tabs)/home');
  else if (toast.type === 'ACCEPT' || missionId) router.push('/(tabs)/tracking');
}

/**
 * Behaviour of the in-app toast: slide in/out (respecting reduced motion), auto-dismiss that
 * pauses while touched, swipe-up to dismiss, and tap to open what the notification is about.
 */
export function useToastController() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const activeToast = useNotificationStore((state) => state.activeToast);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  const reduceMotion = useReducedMotion();
  const [avatarFailed, setAvatarFailed] = useState(false);

  const restingY = Math.max(insets.top, 12) + 6;
  const translateY = useRef(new Animated.Value(restingY - SLIDE_DISTANCE)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    // Read from the store, so that the pop-up on screen is the one opened.
    const toast = useNotificationStore.getState().activeToast;
    if (!toast) return;
    clearDismissTimer();
    dismissToast();

    openToastTarget(toast, router);
  }, [clearDismissTimer, dismissToast, router]);

  // The gesture handler is created once: it reaches the current functions through this, never through the ones that
  // existed when no pop-up was on screen yet (a tap did nothing for that reason).
  const live = useRef({ restingY, clearDismissTimer, startDismissTimer, handleDismiss, handlePressToast });
  live.current = { restingY, clearDismissTimer, startDismissTimer, handleDismiss, handlePressToast };

  // PanResponder for swipe-up dismiss and pausing timer while touching
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        live.current.clearDismissTimer();
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) {
          // Follow swipe upwards smoothly
          translateY.setValue(live.current.restingY + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -16 || gesture.vy < -0.28) {
          // Swipe up threshold met -> Dismiss immediately
          live.current.handleDismiss();
        } else if (Math.abs(gesture.dy) < 8 && Math.abs(gesture.dx) < 8) {
          // Tap detected -> open what the pop-up is about
          live.current.handlePressToast();
        } else {
          // Snap back to resting position and restart the timer
          Animated.timing(translateY, {
            toValue: live.current.restingY,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
          live.current.startDismissTimer();
        }
      },
      onPanResponderTerminate: () => {
        live.current.startDismissTimer();
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
