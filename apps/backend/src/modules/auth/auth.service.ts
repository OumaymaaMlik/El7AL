import { db } from '../../config/db.js';
import { hashPassword, verifyPassword } from '../../utils/hash.js';
import { RegisterClientInput, RegisterProviderInput, LoginInput } from './auth.schema.js';
import { UserRole, AccountStatus } from '@el7al/shared';

export async function registerClient(input: RegisterClientInput) {
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ phoneNumber: input.phoneNumber }, ...(input.email ? [{ email: input.email }] : [])],
    },
  });

  if (existingUser) {
    throw new Error('A user with this phone number or email already exists.');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await db.user.create({
    data: {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      email: input.email || null,
      passwordHash,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
      clientProfile: {
        create: {
          defaultAddress: input.defaultAddress || null,
        },
      },
    },
    include: {
      clientProfile: true,
    },
  });

  return user;
}

export async function registerProvider(input: RegisterProviderInput) {
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ phoneNumber: input.phoneNumber }, ...(input.email ? [{ email: input.email }] : [])],
    },
  });

  if (existingUser) {
    throw new Error('A user with this phone number or email already exists.');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await db.user.create({
    data: {
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      email: input.email || null,
      passwordHash,
      role: UserRole.PROVIDER,
      status: AccountStatus.PENDING_VERIFICATION,
      providerProfile: {
        create: {
          bio: input.bio || null,
          radiusKm: input.radiusKm || 15.0,
          walletBalance: 0.0,
          documentsUrl: [...(input.documentsUrl ?? []), input.cinFrontUrl, input.cinBackUrl].filter((u): u is string =>
            Boolean(u),
          ),
          cinNumber: input.cinNumber ?? null,
          licenseNumber: input.licenseNumber ?? null,
          vehicleType: input.vehicleType ?? null,
          categories: {
            create: input.categoryIds.map((catId) => ({
              categoryId: catId,
            })),
          },
        },
      },
    },
    include: {
      providerProfile: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await db.user.findFirst({
    where: {
      OR: [{ phoneNumber: input.identifier }, { email: input.identifier }],
    },
    include: {
      clientProfile: true,
      providerProfile: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Invalid credentials.');
  }

  if (user.status === AccountStatus.BLOCKED) {
    throw new Error('Account has been suspended or blocked by administration.');
  }

  const isValidPassword = await verifyPassword(user.passwordHash, input.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials.');
  }

  return user;
}

export async function getUserProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
      clientProfile: true,
      providerProfile: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User profile not found.');
  }

  return user;
}

interface ProfileChanges {
  fullName?: string;
  avatarUrl?: string;
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
  bio?: string;
  pushToken?: string;
  oldPassword?: string;
  password?: string;
}

/**
 * Updates what an account may change by itself: name, photo, address, presentation, push token, password.
 * The e-mail address changes only through the verified flow (modules/user/emailChange.ts); the phone number is
 * fixed because nothing proves a new one.
 */
export async function updateUserProfile(userId: string, data: ProfileChanges) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  let newPasswordHash;
  if (data.password) {
    if (data.password.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
    }
    if (!data.oldPassword) {
      throw new Error("L'ancien mot de passe est requis.");
    }
    if (!(await verifyPassword(user.passwordHash, data.oldPassword))) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    newPasswordHash = await hashPassword(data.password);
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName ? { fullName: data.fullName } : {}),
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.pushToken ? { pushToken: data.pushToken } : {}),
      ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
    },
    include: {
      clientProfile: true,
      providerProfile: true,
    },
  });

  if (
    user.role === 'CLIENT' &&
    (data.defaultAddress || data.defaultLat || data.defaultLng) &&
    updatedUser.clientProfile
  ) {
    await db.clientProfile.update({
      where: { userId },
      data: {
        ...(data.defaultAddress && { defaultAddress: data.defaultAddress }),
        ...(data.defaultLat && { defaultLat: data.defaultLat }),
        ...(data.defaultLng && { defaultLng: data.defaultLng }),
      },
    });
  }

  if (
    user.role === 'PROVIDER' &&
    (data.bio || data.defaultAddress || data.defaultLat || data.defaultLng) &&
    updatedUser.providerProfile
  ) {
    await db.providerProfile.update({
      where: { userId },
      data: {
        ...(data.bio && { bio: data.bio }),
        ...(data.defaultAddress && { address: data.defaultAddress }),
        // A GPS fix taken with the address also becomes the artisan's position.
        ...(data.defaultLat && data.defaultLng && { currentLat: data.defaultLat, currentLng: data.defaultLng }),
      },
    });
  }

  return getUserProfile(userId);
}
