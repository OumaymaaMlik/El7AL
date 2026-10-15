/**
 * El 7al design tokens: spacing, shape and size.
 * One 4-point spacing scale, three corner radii, six type sizes.
 */
import { Platform, TextStyle } from 'react-native';

/**
 * Add to every TextInput's style. Lets the field shrink inside a row and, on the
 * web, removes the browser's own focus ring (the field border shows focus instead).
 */
export const inputReset: TextStyle =
  Platform.OS === 'web' ? ({ minWidth: 0, outlineStyle: 'none' } as unknown as TextStyle) : { minWidth: 0 };

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Horizontal page margin used by every screen. */
export const gutter = 20;

export const radius = {
  /** Tags, chips, small insets */
  sm: 8,
  /** Controls, cards, list panels */
  md: 14,
  /** Hero panels and bottom sheets */
  lg: 24,
  /** Circles (avatars, dots, switches) */
  full: 999,
} as const;

/** Minimum touch target on both platforms. */
export const hitTarget = 44;

/** Standard control height (buttons, inputs). */
export const controlHeight = 52;

/** Height of the bottom tab bar above the device's bottom inset. */
export const tabBarHeight = 64;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  heading: 22,
  title: 34,
  display: 44,
} as const;
