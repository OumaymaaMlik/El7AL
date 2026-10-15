import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useType } from '../theme/useType';
import { controlHeight, radius, space } from '../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  /**
   * accent: the single primary action of a screen (lime).
   * primary: brand green. secondary: quiet filled. outline: bordered. destructive: red.
   */
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  /** Where the icon sits relative to the label. Defaults to after the label. */
  iconPosition?: 'left' | 'right';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'accent',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  accessibilityLabel,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  const type = useType();

  const getVariantStyles = (): { button: ViewStyle; text: { color: string } } => {
    switch (variant) {
      case 'primary':
        return { button: { backgroundColor: colors.brand }, text: { color: colors.onBrand } };
      case 'secondary':
        return { button: { backgroundColor: colors.raised }, text: { color: colors.text } };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
          text: { color: colors.text },
        };
      case 'destructive':
        return { button: { backgroundColor: colors.danger }, text: { color: '#FFFFFF' } };
      case 'accent':
      default:
        return { button: { backgroundColor: colors.action }, text: { color: colors.onAction } };
    }
  };

  const vStyles = getVariantStyles();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        vStyles.button,
        pressed && styles.pressed,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} />
      ) : (
        <>
          {iconPosition === 'left' && icon}
          <Text
            style={[type.button, vStyles.text, styles.text, textStyle]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {title}
          </Text>
          {iconPosition === 'right' && icon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: controlHeight,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    flexShrink: 1,
  },
});
