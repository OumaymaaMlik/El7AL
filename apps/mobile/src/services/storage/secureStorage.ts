import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../../shared/utils/logger';

export async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      logger.warn('localStorage set error:', e);
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    logger.warn('SecureStore set error:', e);
  }
}

export async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    logger.warn('SecureStore get error:', e);
    return null;
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      logger.warn('localStorage remove error:', e);
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (e) {
    logger.warn('SecureStore delete error:', e);
  }
}
