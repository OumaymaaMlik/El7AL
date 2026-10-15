/**
 * Idempotent first-start setup for a fresh production database: the service categories and one admin
 * account. Safe to run on every deploy (it only fills what is missing) and never deletes anything.
 *
 *   ADMIN_EMAIL, ADMIN_PASSWORD (min 12 characters), optional ADMIN_PHONE (+216 and 8 digits)
 */
import { AccountStatus, UserRole } from '@prisma/client';
import { db } from '../config/db.js';
import { hashPassword } from '../utils/hash.js';

const CATEGORIES = [
  { name: 'Plomberie', icon: 'Wrench', description: "Fuites d'eau, canalisations, robinetterie, chauffe-eau" },
  { name: 'Électricité', icon: 'Zap', description: 'Pannes électriques, installation de prises, tableaux électriques' },
  { name: 'Mécanique & Auto', icon: 'Car', description: 'Dépannage automobile, vidange, batterie, diagnostic' },
  { name: 'Climatisation & Froid', icon: 'Fan', description: 'Entretien, recharge fréon, réparation climatiseurs' },
  { name: 'Chauffage & Gaz', icon: 'Flame', description: 'Dépannage chaudière, radiateurs, chauffe-eau à gaz' },
  { name: 'Serrurerie', icon: 'Key', description: 'Dépannage serrures, portes bloquées, clés cassées' },
  {
    name: 'Peinture & Rénovation',
    icon: 'PaintBucket',
    description: "Peinture d'intérieur, revêtements, petits travaux",
  },
  { name: 'Ménage & Entretien', icon: 'Sparkles', description: 'Nettoyage domicile, repassage, entretien régulier' },
];

async function main() {
  if ((await db.category.count()) === 0) {
    await db.category.createMany({ data: CATEGORIES });
    console.log(`Created ${CATEGORIES.length} service categories.`);
  } else {
    console.log('Categories already exist: left untouched.');
  }

  if ((await db.user.count({ where: { role: UserRole.ADMIN } })) > 0) {
    console.log('An admin account already exists: left untouched.');
    return;
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) to create the first admin account.');
  }
  const phone = process.env.ADMIN_PHONE?.trim() || '+21620000000';

  await db.user.create({
    data: {
      fullName: 'Admin El 7al',
      email,
      phoneNumber: phone,
      passwordHash: await hashPassword(password),
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });
  console.log(`Created the admin account ${email}.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
