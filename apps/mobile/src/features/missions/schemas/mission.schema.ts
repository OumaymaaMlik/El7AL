import { z } from 'zod';

/** A coordinate the server may send as a number or a numeric string; always a number (or null) for the app. */
const coordinate = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v)))
  .optional();

/** A chat message as the server sends it (also used by the chat feature). */
export const chatMessageSchema = z
  .object({
    id: z.string(),
    senderId: z.string(),
    missionId: z.string().nullish(),
    content: z.string().nullish(),
    isRead: z.boolean().nullish(),
    readAt: z.string().nullish(),
    createdAt: z.string().nullish(),
    senderName: z.string().nullish(),
    senderAvatar: z.string().nullish(),
  })
  .passthrough();
export type ChatMessage = z.infer<typeof chatMessageSchema>;

/** The person on the other side of a mission: only the fields the app shows. */
const personSchema = z.object({
  fullName: z.string().nullish(),
  phoneNumber: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  ratingAverage: z.union([z.number(), z.string()]).nullish(),
});

/** Fields the app relies on; everything else the server sends is passed through untouched. */
export const missionSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    addressText: z.string().nullish(),
    pickupLat: coordinate,
    pickupLng: coordinate,
    description: z.string().nullish(),
    messages: z.array(chatMessageSchema).nullish(),
    /** Total unread messages from the other party (not limited to the messages sent along). */
    unreadCount: z.number().nullish(),
    createdAt: z.string().nullish(),
    startedAt: z.string().nullish(),
    completedAt: z.string().nullish(),
    category: z.object({ name: z.string().nullish() }).passthrough().nullish(),
    review: z
      .object({ rating: z.union([z.number(), z.string()]), comment: z.string().nullish() })
      .passthrough()
      .nullish(),
    client: z.object({ user: personSchema.optional() }).passthrough().nullish(),
    provider: z
      .object({
        id: z.string().optional(),
        user: personSchema.optional(),
        ratingAverage: z.union([z.number(), z.string()]).nullish(),
      })
      .passthrough()
      .nullish(),
  })
  .passthrough();
export type Mission = z.infer<typeof missionSchema>;

export const missionResponseSchema = z.object({ success: z.boolean(), data: missionSchema });

export const missionHistoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(missionSchema),
  meta: z.object({ completedCount: z.number() }).optional(),
});

export const requestMissionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    mission: z.object({ id: z.string() }).passthrough(),
    notifiedProviderCount: z.number().optional(),
  }),
});

export interface RequestMissionInput {
  categoryId: string;
  pickupLat: number;
  pickupLng: number;
  addressText: string;
  description: string;
  radiusKm: number;
}
