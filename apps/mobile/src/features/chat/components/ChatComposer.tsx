import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { inputReset, space } from '../../../shared/theme/tokens';
import { useType } from '../../../shared/theme/useType';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

interface Props {
  /** Returns true when the message was accepted (the input is then cleared). */
  onSend: (text: string) => boolean;
  /** Extra space under the composer, for a tab bar or the device's bottom inset. */
  bottomInset?: number;
}

export function ChatComposer({ onSend, bottomInset = 0 }: Props) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const type = useType();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const canSend = text.trim().length > 0;
  const submit = () => {
    if (onSend(text)) setText('');
  };

  return (
    <View
      style={[
        styles.composer,
        { borderTopColor: colors.border, backgroundColor: colors.surface, paddingBottom: space.sm + bottomInset },
      ]}
    >
      <TextInput
        accessibilityLabel={t('typeMessage')}
        style={[
          type.body,
          styles.input,
          inputReset,
          {
            backgroundColor: colors.background,
            borderColor: focused ? colors.accentText : colors.border,
            color: colors.text,
          },
        ]}
        placeholder={t('typeMessage')}
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        onSubmitEditing={submit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="send"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('send')}
        accessibilityState={{ disabled: !canSend }}
        onPress={submit}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.send,
          { backgroundColor: colors.hero },
          !canSend && { opacity: 0.45 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Mirrored>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path
              d="M4 12l16-8-6 16-2.5-6.5z"
              fill={colors.live}
              stroke={colors.live}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </Svg>
        </Mirrored>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
