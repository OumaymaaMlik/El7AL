import type { ViewStyle } from 'react-native';

/** `user-select: none` is a web-only style: react-native-web understands it, React Native's types do not. */
export const noSelect = { userSelect: 'none' } as unknown as ViewStyle;
