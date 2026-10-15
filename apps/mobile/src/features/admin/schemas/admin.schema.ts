import { z } from 'zod';
import { missionSchema } from '../../missions';

const looseRecord = z.record(z.string(), z.any()).nullish();

export const adminUserSchema = z
  .object({
    id: z.string(),
    role: z.string(),
    status: z.string(),
    fullName: z.string().nullish(),
    email: z.string().nullish(),
    phoneNumber: z.string().nullish(),
    createdAt: z.string().nullish(),
    disputesCount: z.any().optional(),
    clientProfile: looseRecord,
    providerProfile: looseRecord,
  })
  .passthrough();
export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminMissionSchema = missionSchema.extend({
  durationMinutes: z.any().optional(),
  commissionFee: z.any().optional(),
});
export type AdminMission = z.infer<typeof adminMissionSchema>;

export const adminCategorySchema = z
  .object({ id: z.string(), name: z.string(), description: z.string().nullish() })
  .passthrough();
export type AdminCategory = z.infer<typeof adminCategorySchema>;

export const topupSchema = z
  .object({
    id: z.string(),
    amount: z.any(),
    uniqueRef: z.any().optional(),
    provider: z
      .object({ user: z.object({ fullName: z.string().nullish() }).passthrough().nullish() })
      .passthrough()
      .nullish(),
  })
  .passthrough();
export type Topup = z.infer<typeof topupSchema>;

export const disputeSchema = z
  .object({ id: z.string(), status: z.string(), reason: z.string().nullish(), createdAt: z.string().nullish() })
  .passthrough();
export type Dispute = z.infer<typeof disputeSchema>;

/** An artisan waiting for the identity check, with the documents the admin looks at. */
export const pendingProviderSchema = z
  .object({
    id: z.string(),
    cinNumber: z.string().nullish(),
    licenseNumber: z.string().nullish(),
    vehicleType: z.string().nullish(),
    bio: z.string().nullish(),
    radiusKm: z.number().nullish(),
    documentsUrl: z.array(z.string()).nullish(),
    user: z
      .object({
        id: z.string(),
        fullName: z.string().nullish(),
        phoneNumber: z.string().nullish(),
        email: z.string().nullish(),
        createdAt: z.string().nullish(),
      })
      .passthrough(),
    categories: z
      .array(z.object({ category: z.object({ id: z.string(), name: z.string() }).passthrough() }).passthrough())
      .nullish(),
  })
  .passthrough();
export type PendingProvider = z.infer<typeof pendingProviderSchema>;

export const adminStatsSchema = z.record(z.string(), z.any());
export type AdminStats = z.infer<typeof adminStatsSchema>;

export type AdminTab = 'ANALYTICS' | 'VERIFICATIONS' | 'USERS' | 'MISSIONS' | 'SERVICES' | 'TOPUPS' | 'DISPUTES';
export type UserRoleFilter = 'ALL' | 'CLIENT' | 'PROVIDER';
