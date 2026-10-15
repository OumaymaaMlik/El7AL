import { Platform } from 'react-native';
import { api } from '../../../services/http/client';
import type { Coords } from '../../map/services/location';
import { avatarUploadResponseSchema, profileResponseSchema, type UpdateProfileInput } from '../schemas/profile.schema';

export async function fetchProfile() {
  const res = await api.get('/auth/me');
  const parsed = profileResponseSchema.parse(res.data);
  return parsed.success ? parsed.data : null;
}

/** Returns the updated profile, or null when the server reports failure. */
export async function updateProfile(input: UpdateProfileInput) {
  const res = await api.put('/users/profile', input);
  const parsed = profileResponseSchema.parse(res.data);
  return parsed.success ? parsed.data : null;
}

/** Erases the account (the server checks the password and refuses while a job is open). */
export async function deleteAccount(password: string) {
  await api.delete('/users/me', { data: { password } });
}

/** Step 1 of an e-mail change: the server sends a code to the NEW address. */
export async function requestEmailChange(email: string) {
  const res = await api.post('/users/email/request-change', { email });
  return { success: Boolean(res.data?.success), message: res.data?.message as string | undefined };
}

/** Step 2: the right code makes the new address the account's address. */
export async function confirmEmailChange(email: string, code: string) {
  const res = await api.post('/users/email/confirm-change', { email, code });
  return Boolean(res.data?.success);
}

/** Goes online (with the device's real position) or offline. */
export async function setAvailability(isAvailable: boolean, coords?: Coords) {
  await api.put('/geo/provider/availability', {
    isAvailable,
    ...(coords ? { currentLat: coords.lat, currentLng: coords.lng } : {}),
  });
}

/** Uploads a local image as the avatar. Returns the hosted URL, or null when the server returns none. */
export async function uploadAvatar(uri: string): Promise<string | null> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    formData.append('file', blob, 'avatar.jpg');
  } else {
    formData.append('file', { uri, name: 'avatar.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  const res = await api.post('/uploads/avatar', formData, { headers: { 'Content-Type': undefined } });
  return avatarUploadResponseSchema.parse(res.data).url ?? null;
}
