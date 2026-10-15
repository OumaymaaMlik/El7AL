import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { controlHeight, gutter, inputReset, radius, space } from '../../../shared/theme/tokens';
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
        { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: space.sm + bottomInset },
      ]}
    >
      <TextInput
        accessibilityLabel={t('typeMessage')}
        style={[
          type.body,
          styles.input,
          inputReset,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.accentText : colors.inputBorder,
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
          { backgroundColor: colors.action },
          !canSend && { opacity: 0.45 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Mirrored>
          <Send size={20} color={colors.onAction} />
        </Mirrored>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: gutter,
    paddingTop: space.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: controlHeight,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  send: {
    width: controlHeight,
    height: controlHeight,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
