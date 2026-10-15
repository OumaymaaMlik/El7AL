import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { numeralFont } from '../theme/typography';
import { useThemeStore } from '../store/useThemeStore';
import { initialsOf } from '../utils/format';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  failed?: boolean;
  onError?: () => void;
  /** Overrides the initials colors (defaults to the theme). */
  tint?: { background: string; color: string };
}

/** Round avatar showing the image, or the user's initials when there is none or it failed to load. */
export function Avatar({ uri, name, size = 72, failed = false, onError, tint }: AvatarProps) {
  const colors = useThemeStore((state) => state.colors);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [uri]);
  const handleError = () => {
    setImageFailed(true);
    onError?.();
  };
  const showImage = Boolean(uri) && !failed && !imageFailed;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tint?.background ?? colors.raised },
      ]}
    >
      {showImage ? (
        <Image source={{ uri: uri as string }} style={styles.image} onError={handleError} />
      ) : (
        <Text style={[styles.text, { color: tint?.color ?? colors.text, fontSize: size * 0.39 }]}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  text: { fontFamily: numeralFont },
});
