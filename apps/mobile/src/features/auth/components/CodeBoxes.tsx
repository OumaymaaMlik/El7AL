import { useEffect, useRef } from 'react';
import { Animated, NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';
import { inputReset } from '../../../shared/theme/tokens';
import { numeralFont } from '../../../shared/theme/typography';

interface Props {
  length: number;
  value: string;
  onChange: (value: string) => void;
  /** Changes whenever a wrong code should shake the boxes. */
  shakeKey?: number;
  autoFocus?: boolean;
}

/** The code field of the prototype: one big box per digit, focus moves on by itself, a paste fills them all. */
export function CodeBoxes({ length, value, onChange, shakeKey = 0, autoFocus = true }: Props) {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useTranslation();
  const refs = useRef<(TextInput | null)[]>([]);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!shakeKey) return;
    shake.setValue(0);
    Animated.sequence(
      [6, -6, 4, -4, 0].map((to) => Animated.timing(shake, { toValue: to, duration: 70, useNativeDriver: true })),
    ).start();
  }, [shakeKey, shake]);

  useEffect(() => {
    if (!autoFocus) return;
    const id = setTimeout(() => refs.current[0]?.focus(), 450);
    return () => clearTimeout(id);
  }, [autoFocus]);

  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const setAt = (index: number, text: string) => {
    const clean = text.replace(/\D/g, '');
    if (clean.length > 1) {
      // A paste (or the keyboard's one-time-code suggestion) fills the boxes from the start.
      onChange(clean.slice(0, length));
      refs.current[Math.min(clean.length, length) - 1]?.focus();
      return;
    }
    const next = digits
      .map((d, i) => (i === index ? clean.slice(-1) || ' ' : d))
      .join('')
      .replace(/ +$/, '');
    onChange(next.replace(/ /g, ''));
    if (clean && index < length - 1) refs.current[index + 1]?.focus();
  };

  const onKey = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index].trim() && index > 0) {
      onChange(value.slice(0, index - 1));
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX: shake }] }]}>
      {digits.map((d, i) => {
        const filled = Boolean(d.trim());
        return (
          <View key={i} style={styles.cell}>
            <TextInput
              ref={(r) => {
                refs.current[i] = r;
              }}
              accessibilityLabel={t('codeBoxLabel').replace('{n}', String(i + 1))}
              value={filled ? d : ''}
              onChangeText={(text) => setAt(i, text)}
              onKeyPress={(e) => onKey(i, e)}
              keyboardType="number-pad"
              maxLength={length}
              textContentType="oneTimeCode"
              selectTextOnFocus
              style={[
                styles.box,
                inputReset,
                {
                  backgroundColor: colors.surface,
                  borderColor: filled ? colors.brand : colors.border,
                  borderWidth: filled ? 1.5 : 1,
                  color: colors.text,
                  caretColor: colors.brand,
                } as object,
              ]}
            />
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1, minWidth: 0 },
  box: {
    height: 68,
    borderRadius: 16,
    textAlign: 'center',
    fontFamily: numeralFont,
    fontSize: 30,
    paddingHorizontal: 0,
  },
});
