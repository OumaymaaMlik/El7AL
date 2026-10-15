import { z } from 'zod';
import { userRoleSchema } from '../../auth/schemas/auth.schema';

const looseRecord = z.record(z.string(), z.any()).nullish();

export const profileSchema = z
  .object({
    id: z.string(),
    role: userRoleSchema,
    fullName: z.string().nullish(),
    phoneNumber: z.string().nullish(),
    email: z.string().nullish(),
    status: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    walletBalance: z.any().optional(),
    clientProfile: looseRecord,
    providerProfile: looseRecord,
  })
  .passthrough();
export type Profile = z.infer<typeof profileSchema>;

export const profileResponseSchema = z.object({ success: z.boolean(), data: profileSchema });
export const avatarUploadResponseSchema = z.object({ url: z.string().optional() }).passthrough();

export interface UpdateProfileInput {
  fullName: string;
  defaultAddress: string;
  defaultLat: number;
  defaultLng: number;
  bio: string;
  avatarUrl: string;
  oldPassword?: string;
  password?: string;
}
