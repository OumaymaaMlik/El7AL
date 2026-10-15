import { z } from 'zod';

export const categorySchema = z
  .object({ id: z.string(), name: z.string(), icon: z.string().nullish(), description: z.string().nullish() })
  .passthrough();
export type Category = z.infer<typeof categorySchema>;

export const categoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(categorySchema),
});
