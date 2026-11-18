import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Camera, Check } from 'lucide-react-native';
import { Txt } from '../../../shared/ui/Txt';
import { useThemeStore } from '../../../shared/store/useThemeStore';
import { useTranslation } from '../../../shared/store/useLanguageStore';

/**
 * One document to photograph: a dashed box with a camera, and its name underneath. Once a photo is added the
 * box turns solid green with the picture and a check.
 */
export function UploadBox({ label, uri, onPress }: { label: string; uri: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const { t } = useTranslation();
  const done = Boolean(uri);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${done ? t('changePhoto') : t('addPhoto')}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}
    >
      <View
        style={[
          styles.box,
          done
            ? { borderColor: colors.brand, borderWidth: 1.5, backgroundColor: colors.tint }
            : {
                borderColor: colors.borderStrong,
                borderWidth: 1.5,
                borderStyle: 'dashed',
                backgroundColor: colors.surface,
              },
        ]}
      >
        {done ? (
          <>
            <Image source={{ uri }} style={styles.preview} />
            <View style={[styles.check, { backgroundColor: colors.brand }]}>
              <Check size={12} color="#fff" strokeWidth={3.4} />
            </View>
          </>
        ) : (
          <Camera size={24} color={colors.textMuted} strokeWidth={2} />
        )}
      </View>
      <Txt variant="captionStrong" numberOfLines={2} style={styles.label}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 0, gap: 8, alignItems: 'center' },
  box: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  check: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
});
