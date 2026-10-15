import { z } from 'zod';

export const registerClientSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  defaultAddress: z.string().optional().nullable(),
});

export const registerProviderSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().optional().nullable(),
  radiusKm: z.number().min(1).max(100).default(15.0),
  categoryIds: z.array(z.string()).min(1, 'Select at least one service category'),
  documentsUrl: z.array(z.string()).max(5).optional(),
  cinNumber: z
    .string()
    .regex(/^[0-9]{8}$/)
    .optional(),
  cinFrontUrl: z.string().optional(),
  cinBackUrl: z.string().optional(),
  licenseNumber: z.string().max(40).optional(),
  vehicleType: z.enum(['CAR', 'VAN', 'MOTO']).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter email or phone number'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type RegisterProviderInput = z.infer<typeof registerProviderSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
