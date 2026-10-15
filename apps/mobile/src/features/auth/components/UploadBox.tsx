import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { radius } from '../../../shared/theme/tokens';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

export function UploadBox({ label, uri, onPress }: { label: string; uri: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${uri ? t('changePhoto') : t('addPhoto')}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.box,
        { borderColor: colors.inputBorder, backgroundColor: colors.surface },
        pressed && { opacity: 0.75 },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.preview} />
      ) : (
        <>
          <Camera size={22} color={colors.accentText} />
          <Txt variant="smallStrong">{label}</Txt>
          <Txt variant="caption" color={colors.textMuted}>
            {t('addPhoto')}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    height: 116,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
});
