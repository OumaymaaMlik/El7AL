import { z } from 'zod';
import { api } from '../../../services/http/client';
import {
  authSuccessSchema,
  sendCodeResponseSchema,
  uploadResponseSchema,
  type LoginInput,
  type RegisterClientInput,
  type RegisterProviderInput,
} from '../schemas/auth.schema';

export async function login(input: LoginInput) {
  const res = await api.post('/auth/login', input);
  return authSuccessSchema.parse(res.data);
}

export async function registerClient(input: RegisterClientInput) {
  const res = await api.post('/auth/register/client', input);
  return authSuccessSchema.parse(res.data);
}

export async function registerProvider(input: RegisterProviderInput) {
  const res = await api.post('/auth/register/provider', input);
  return authSuccessSchema.parse(res.data);
}

export async function sendEmailVerification(email: string, fullName?: string) {
  const res = await api.post('/auth/email/send-verification', { email, fullName });
  return sendCodeResponseSchema.parse(res.data);
}

export async function verifyEmailCode(email: string, code: string) {
  const res = await api.post('/auth/email/verify', { email, code });
  return Boolean(res.data?.success);
}

/** Uploads a local image and returns its server URL, or null when the server returns none. */
export async function uploadDocument(uri: string, name: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', { uri, name, type: 'image/jpeg' } as unknown as Blob);
  const res = await api.post('/uploads/document', formData, { headers: { 'Content-Type': undefined } });
  return uploadResponseSchema.parse(res.data).url ?? null;
}

/** Asks the server to email a reset code. The answer is the same whether or not the account exists. */
export async function requestPasswordReset(identifier: string) {
  const res = await api.post('/auth/password/forgot', { identifier });
  return z.object({ success: z.boolean(), code: z.string().optional() }).parse(res.data);
}

export async function resetPassword(input: { identifier: string; code: string; newPassword: string }) {
  await api.post('/auth/password/reset', input);
}
