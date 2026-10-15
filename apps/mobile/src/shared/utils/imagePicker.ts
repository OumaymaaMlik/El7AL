import { Platform } from 'react-native';
import { logger } from './logger';

export async function pickImageFromDevice(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  }

  try {
    // Loaded on demand so a build without the module still starts.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImagePicker = require('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      return result.assets[0].uri;
    }
  } catch (e) {
    logger.warn('Image picker error:', e);
  }

  return null;
}
