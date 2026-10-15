/**
 * El 7al design tokens: typography.
 *
 * Two families:
 *  - Barlow Condensed for headings, numerals and status labels (the "signage" voice).
 *  - IBM Plex Sans for everything people read or tap.
 * Arabic uses IBM Plex Sans Arabic for both roles, so French and Arabic look like one product.
 *
 * Each weight is its own font file, so styles set `fontFamily` only. Do not add
 * `fontWeight` next to these families: the weight is already in the file, and an
 * extra `fontWeight` makes the platform synthesise a second, heavier bold on top.
 */
import { TextStyle } from 'react-native';
import { BarlowCondensed_600SemiBold } from '@expo-google-fonts/barlow-condensed/600SemiBold';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans/400Regular';
import { IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans/500Medium';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { fontSize } from './tokens';

/** Passed to `useFonts` once, in the root layout. */
export const FONT_ASSETS = {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
};

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'overline'
  | 'body'
  | 'bodyMedium'
  | 'bodyStrong'
  | 'small'
  | 'smallStrong'
  | 'caption'
  | 'captionStrong'
  | 'button';

export type TypeScale = Record<TextVariant, TextStyle>;

const latin: TypeScale = {
  display: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: fontSize.display, lineHeight: 46 },
  title: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: fontSize.title, lineHeight: 36 },
  heading: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: fontSize.heading, lineHeight: 26 },
  overline: {
    fontFamily: 'BarlowCondensed_600SemiBold',
    fontSize: fontSize.small,
    lineHeight: 18,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  body: { fontFamily: 'IBMPlexSans_400Regular', fontSize: fontSize.body, lineHeight: 22 },
  bodyMedium: { fontFamily: 'IBMPlexSans_500Medium', fontSize: fontSize.body, lineHeight: 22 },
  bodyStrong: { fontFamily: 'IBMPlexSans_600SemiBold', fontSize: fontSize.body, lineHeight: 22 },
  small: { fontFamily: 'IBMPlexSans_400Regular', fontSize: fontSize.small, lineHeight: 20 },
  smallStrong: { fontFamily: 'IBMPlexSans_500Medium', fontSize: fontSize.small, lineHeight: 20 },
  caption: { fontFamily: 'IBMPlexSans_400Regular', fontSize: fontSize.caption, lineHeight: 16 },
  captionStrong: { fontFamily: 'IBMPlexSans_500Medium', fontSize: fontSize.caption, lineHeight: 16 },
  button: { fontFamily: 'IBMPlexSans_600SemiBold', fontSize: fontSize.body, lineHeight: 22 },
};

// Arabic: no condensed face and no letter-spacing (it breaks joined letters).
// Display sizes are reduced because Plex Arabic is wider than Barlow Condensed.
const arabic: TypeScale = {
  display: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: 34, lineHeight: 46 },
  title: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: 26, lineHeight: 38 },
  heading: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: 19, lineHeight: 28 },
  overline: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: 13, lineHeight: 20 },
  body: { fontFamily: 'IBMPlexSansArabic_400Regular', fontSize: fontSize.body, lineHeight: 26 },
  bodyMedium: { fontFamily: 'IBMPlexSansArabic_500Medium', fontSize: fontSize.body, lineHeight: 26 },
  bodyStrong: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: fontSize.body, lineHeight: 26 },
  small: { fontFamily: 'IBMPlexSansArabic_400Regular', fontSize: fontSize.small, lineHeight: 22 },
  smallStrong: { fontFamily: 'IBMPlexSansArabic_500Medium', fontSize: fontSize.small, lineHeight: 22 },
  caption: { fontFamily: 'IBMPlexSansArabic_400Regular', fontSize: fontSize.caption, lineHeight: 18 },
  captionStrong: { fontFamily: 'IBMPlexSansArabic_500Medium', fontSize: fontSize.caption, lineHeight: 18 },
  button: { fontFamily: 'IBMPlexSansArabic_600SemiBold', fontSize: fontSize.body, lineHeight: 24 },
};

export function getTypeScale(language: string): TypeScale {
  return language === 'ar' ? arabic : latin;
}

/** Family for the brand wordmark and large numerals, which are always Latin. */
export const numeralFont = 'BarlowCondensed_600SemiBold';
export const wordmarkFont = 'BarlowCondensed_700Bold';
