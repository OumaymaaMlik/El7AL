import { z } from 'zod';

export const userRoleSchema = z.enum(['CLIENT', 'PROVIDER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

const profileSchema = z.record(z.string(), z.any()).nullish();

export const userSessionSchema = z
  .object({
    id: z.string().min(1),
    fullName: z.string(),
    phoneNumber: z.string(),
    email: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    role: userRoleSchema,
    status: z.string(),
    providerProfile: profileSchema,
    clientProfile: profileSchema,
  })
  .passthrough();
export type UserSession = z.infer<typeof userSessionSchema>;

/** Successful login / registration response. */
export const authSuccessSchema = z.object({
  success: z.literal(true),
  token: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  user: userSessionSchema,
});
export type AuthSuccess = z.infer<typeof authSuccessSchema>;

export const sendCodeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  /** Only present when the backend runs in development mode. */
  code: z.string().optional(),
});

export const uploadResponseSchema = z.object({ url: z.string().optional() }).passthrough();

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterClientInput {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  defaultAddress: string;
}

export interface RegisterProviderInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  bio: string;
  categoryIds: string[];
  vehicleType: string;
  cinNumber: string;
  cinFrontUrl: string;
  cinBackUrl: string;
  licenseNumber: string;
}
