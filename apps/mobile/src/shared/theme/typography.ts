/**
 * El 7al design tokens: typography.
 *
 * Latin (French, English): Plus Jakarta Sans, from ExtraBold for titles and numerals down to Regular for text.
 * Arabic: IBM Plex Sans Arabic for every role, because Plus Jakarta Sans has no Arabic letters.
 *
 * Each weight is its own font file, so styles set `fontFamily` only. Do not add
 * `fontWeight` next to these families: the weight is already in the file, and an
 * extra `fontWeight` makes the platform synthesise a second, heavier bold on top.
 */
import { TextStyle } from 'react-native';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';
import { IBMPlexSansArabic_600SemiBold } from '@expo-google-fonts/ibm-plex-sans-arabic/600SemiBold';
import { fontSize } from './tokens';

/** Passed to `useFonts` once, in the root layout. */
export const FONT_ASSETS = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
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
  display: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: fontSize.display,
    lineHeight: 48,
    letterSpacing: -1.6,
  },
  title: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: fontSize.title, lineHeight: 38, letterSpacing: -1.4 },
  heading: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: fontSize.heading,
    lineHeight: 28,
    letterSpacing: -0.6,
  },
  overline: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: fontSize.caption,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  body: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: fontSize.body, lineHeight: 24 },
  bodyMedium: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: fontSize.body, lineHeight: 24 },
  bodyStrong: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: fontSize.body, lineHeight: 24 },
  small: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: fontSize.small, lineHeight: 21 },
  smallStrong: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: fontSize.small, lineHeight: 21 },
  caption: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: fontSize.caption, lineHeight: 17 },
  captionStrong: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: fontSize.caption, lineHeight: 17 },
  button: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: fontSize.body, lineHeight: 22 },
};

// Arabic: no letter-spacing (it breaks joined letters). Display sizes are reduced because Plex Arabic is wide.
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
export const numeralFont = 'PlusJakartaSans_800ExtraBold';
export const wordmarkFont = 'PlusJakartaSans_800ExtraBold';
