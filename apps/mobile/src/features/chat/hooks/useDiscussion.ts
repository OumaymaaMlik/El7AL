import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, AppState, Dimensions, Easing, PanResponder, type AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { logger } from '../../../shared/utils/logger';
import { useAuthStore } from '../../auth';
import { fetchMission, type Mission } from '../../missions';
import { useChatStore } from '../store/useChatStore';

const SLIDE_MS = 220;
const CLOSE_MS = 200;

/**
 * The open discussion: which conversation is selected (also via deep link), the slide-in /
 * swipe-to-close animation, and keeping the chat store's "active conversation" accurate
 * while the tab is focused and the app is in the foreground.
 */
export function useDiscussion(deepLinkMissionId?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const [selected, setSelected] = useState<Mission | null>(null);

  const screenWidth = Dimensions.get('window').width || 400;
  const translateX = useRef(new Animated.Value(0)).current;

  const animate = useCallback(
    (toValue: number, duration: number, done?: () => void) =>
      Animated.timing(translateX, { toValue, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(
        done,
      ),
    [translateX],
  );

  const open = (mission: Mission) => {
    setSelected(mission);
    if (userId) useChatStore.getState().markMissionAsRead(mission.id, userId);
  };

  const finishClose = useCallback(() => {
    setSelected(null);
    useChatStore.getState().setActiveMissionId(null);
    translateX.setValue(0);
  }, [translateX]);

  const close = useCallback(() => animate(screenWidth, CLOSE_MS, finishClose), [animate, screenWidth, finishClose]);

  // Deep link: open the conversation for a given mission.
  useEffect(() => {
    if (!deepLinkMissionId) return;
    fetchMission(deepLinkMissionId)
      .then((mission) => mission && setSelected(mission))
      .catch((e) => logger.warn('Deep link chat error:', e));
  }, [deepLinkMissionId]);

  // Slide in when a discussion opens.
  const selectedId = selected?.id;
  useEffect(() => {
    if (selectedId) {
      translateX.setValue(screenWidth);
      animate(0, SLIDE_MS);
    }
  }, [selectedId, screenWidth, translateX, animate]);

  // The active conversation only counts while this tab is focused.
  useFocusEffect(
    useCallback(() => {
      if (selected?.id) {
        useChatStore.getState().setActiveMissionId(selected.id);
        if (userId) useChatStore.getState().markMissionAsRead(selected.id, userId);
      } else {
        useChatStore.getState().setActiveMissionId(null);
      }
      return () => useChatStore.getState().setActiveMissionId(null);
    }, [selected?.id, userId]),
  );

  // ...and only while the app is in the foreground.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next !== 'active') {
        useChatStore.getState().setActiveMissionId(null);
      } else if (selected?.id) {
        useChatStore.getState().setActiveMissionId(selected.id);
        if (userId) useChatStore.getState().markMissionAsRead(selected.id, userId);
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [selected?.id, userId]);

  // Swipe left-to-right to close, like Messenger on iOS.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dx > 12 && g.dx > Math.abs(g.dy) * 1.4,
      onMoveShouldSetPanResponderCapture: (_, g) =>
        g.dx > 14 && g.dx > Math.abs(g.dy) * 1.4 && (g.x0 < screenWidth * 0.45 || g.dx > 25),
      onPanResponderMove: (_, g) => {
        if (g.dx > 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx > screenWidth * 0.28 || g.vx > 0.38) animate(screenWidth, 180, finishClose);
        else animate(0, 180);
      },
      onPanResponderTerminate: () => animate(0, 180),
    }),
  ).current;

  return { selected, open, close, translateX, panHandlers: panResponder.panHandlers };
}
