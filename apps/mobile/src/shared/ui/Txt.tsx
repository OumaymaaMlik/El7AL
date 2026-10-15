import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useType } from '../theme/useType';
import { useLeadingTextAlign } from '../store/useLanguageStore';
import { TextVariant } from '../theme/typography';

interface TxtProps extends TextProps {
  /** One of the six type sizes, by role. Defaults to body text. */
  variant?: TextVariant;
  /** Text colour. Defaults to the primary text colour of the current theme. */
  color?: string;
}

/**
 * The one text component for migrated screens. It picks the right font for the
 * current language and the right default colour for the current theme.
 */
export function Txt({ variant = 'body', color, style, ...rest }: TxtProps) {
  const type = useType();
  const colors = useThemeStore((state) => state.colors);
  const leading = useLeadingTextAlign();
  return <Text {...rest} style={[type[variant], leading, { color: color ?? colors.text }, style]} />;
}
