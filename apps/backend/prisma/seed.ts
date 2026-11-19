/**
 * Development seed: wipes the LOCAL database, then creates the service categories, one admin, two clients and two
 * verified artisans (online, near Tunis). Run: npm run prisma:seed (from apps/backend).
 * It refuses to touch any database that is not on this machine.
 *
 * Logins (development only): admin from ADMIN_EMAIL / ADMIN_PASSWORD (defaults below), everyone else password123.
 */
import { PrismaClient, UserRole, AccountStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.js';
import { updateProviderGeoLocation } from '../src/services/redis.service.js';
import { CATEGORIES } from '../src/scripts/categories.js';

const prisma = new PrismaClient();
const DEV_PASSWORD = 'password123';

async function wipe() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = tables.map((t) => `"${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
}

async function main() {
  const host = new URL(process.env.DATABASE_URL ?? 'postgresql://unset').hostname;
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error(`Refusing to wipe a database that is not local (host: ${host}).`);
  }
  await wipe();
  console.log('Database wiped.');

  await prisma.category.createMany({ data: CATEGORIES });
  const byName = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));

  const passwordHash = await hashPassword(DEV_PASSWORD);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@el7al.com';
  await prisma.user.create({
    data: {
      fullName: 'Admin El 7al',
      phoneNumber: '+21620000000',
      email: adminEmail,
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || 'adminel7al@2026'),
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  const clients = [
    { fullName: 'Sami Ben Salah', phoneNumber: '+21622145880', email: 'sami@example.com', lat: 36.835, lng: 10.238 },
    { fullName: 'Amira Karoui', phoneNumber: '+21698123456', email: 'amira@example.com', lat: 36.85, lng: 10.2 },
  ];
  for (const c of clients) {
    await prisma.user.create({
      data: {
        fullName: c.fullName,
        phoneNumber: c.phoneNumber,
        email: c.email,
        passwordHash,
        role: UserRole.CLIENT,
        status: AccountStatus.ACTIVE,
        clientProfile: { create: { defaultAddress: 'Tunis', defaultLat: c.lat, defaultLng: c.lng } },
      },
    });
  }

  const artisans = [
    {
      fullName: 'Ahmed Plombier',
      phoneNumber: '+21650111222',
      email: 'ahmed@example.com',
      trade: 'Plomberie',
      lat: 36.835,
      lng: 10.238,
    },
    {
      fullName: 'Bilel Électricien',
      phoneNumber: '+21650333444',
      email: 'bilel@example.com',
      trade: 'Électricité',
      lat: 36.84,
      lng: 10.22,
    },
  ];
  for (const a of artisans) {
    const user = await prisma.user.create({
      data: {
        fullName: a.fullName,
        phoneNumber: a.phoneNumber,
        email: a.email,
        passwordHash,
        role: UserRole.PROVIDER,
        status: AccountStatus.ACTIVE,
        providerProfile: {
          create: {
            isAvailable: true,
            currentLat: a.lat,
            currentLng: a.lng,
            verifiedAt: new Date(),
            cinNumber: '12345678',
            vehicleType: 'CAR',
            categories: { create: [{ categoryId: byName.get(a.trade)! }] },
          },
        },
      },
      include: { providerProfile: true },
    });
    await updateProviderGeoLocation(user.providerProfile!.id, a.lat, a.lng);
  }

  console.log('Seeded: 1 admin, 2 clients, 2 artisans (all verified, online).');
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
