import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { useType } from '../theme/useType';
import { controlHeight, hitTarget, inputReset, radius, space } from '../theme/tokens';
import { Txt } from './Txt';

interface InputProps extends TextInputProps {
  label?: string;
  /** Shown under the field in the danger colour. Also turns the border red. */
  error?: string;
  /** Quiet help text under the field, hidden while there is an error. */
  hint?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * The one text field for the app: a label above, a bordered field, and the error
 * message directly underneath. Password fields get a show/hide button.
 */
export function Input({
  label,
  error,
  hint,
  icon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  multiline,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();

  const borderColor = error ? colors.danger : isFocused ? colors.accentText : colors.inputBorder;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {Boolean(label) && (
        <Txt variant="captionStrong" color={colors.textSecondary}>
          {label}
        </Txt>
      )}
      <View
        style={[styles.field, multiline && styles.fieldMultiline, { backgroundColor: colors.surface, borderColor }]}
      >
        {icon && <View style={multiline && styles.iconTop}>{icon}</View>}
        <TextInput
          accessibilityLabel={label}
          style={[
            type.body,
            styles.input,
            inputReset,
            multiline && styles.inputMultiline,
            { color: colors.text },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !revealed}
          multiline={multiline}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? t('hidePassword') : t('showPassword')}
            onPress={() => setRevealed((v) => !v)}
            style={styles.reveal}
          >
            {revealed ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
          </Pressable>
        )}
      </View>
      {error ? (
        <Txt variant="caption" color={colors.dangerText} accessibilityRole="alert">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="caption" color={colors.textMuted}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: space.sm,
  },
  field: {
    minHeight: controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: space.md,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    minHeight: controlHeight - 2,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  reveal: {
    width: hitTarget,
    height: hitTarget,
    marginEnd: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
