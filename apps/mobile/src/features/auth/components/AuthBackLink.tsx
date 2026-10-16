import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { hitTarget, space } from '../../../shared/theme/tokens';
import { Mirrored } from '../../../shared/ui/Mirrored';
import { Txt } from '../../../shared/ui/Txt';

interface AuthBackLinkProps {
  label: string;
  onPress: () => void;
}

/** The quiet "back" link at the top of the access screens. */
export function AuthBackLink({ label, onPress }: AuthBackLinkProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
    >
      <Mirrored>
        <ArrowLeft size={18} color={colors.text} />
      </Mirrored>
      <Txt variant="smallStrong">{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
  },
});
