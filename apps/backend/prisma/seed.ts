import { PrismaClient, type Category, UserRole, AccountStatus, MissionStatus, TransactionStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/hash.js';
import { updateProviderGeoLocation } from '../src/services/redis.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Wiping all old data from database...');

  await prisma.chatMessage.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.topupTransaction.deleteMany({});
  await prisma.providerCategory.deleteMany({});
  await prisma.providerProfile.deleteMany({});
  await prisma.clientProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('✅ Database completely wiped.');

  console.log('🌱 Seeding rich test dataset for El 7al ecosystem...');

  // 1. Seed Categories with Lucide Icon Names
  const categoriesData = [
    { name: 'Plomberie', icon: 'Wrench', description: 'Fuites d\'eau, canalisations, robinetterie, chauffe-eau' },
    { name: 'Électricité', icon: 'Zap', description: 'Pannes électriques, installation de prises, tableaux électriques' },
    { name: 'Mécanique', icon: 'Car', description: 'Dépannage automobile, vidange, batterie, diagnostic mécanique' },
    { name: 'Climatisation', icon: 'Fan', description: 'Entretien, recharge fréon, réparation climatiseurs' },
    { name: 'Serrurerie', icon: 'Key', description: 'Dépannage serrures, portes bloquées, clés cassées' },
    { name: 'Peinture & Bricolage', icon: 'PaintBucket', description: 'Menuiserie, peinture, petits travaux d\'aménagement' },
  ];

  const categories: Record<string, Category> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat,
    });
    categories[cat.name] = created;
  }
  console.log(`✅ ${Object.keys(categories).length} categories seeded.`);

  const passwordHash = await hashPassword('password123');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@el7al.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminel7al@2026';
  const adminPasswordHash = await hashPassword(adminPassword);

  // 2. Seed Admin User
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin El 7al',
      phoneNumber: '+21620000000',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });
  console.log(`✅ Admin user seeded (${admin.email}).`);

  // 3. Seed Test Clients
  const client1 = await prisma.user.create({
    data: {
      fullName: 'Sami Ben Salah',
      phoneNumber: '+21622145880',
      email: 'sami@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
      clientProfile: {
        create: {
          defaultAddress: 'Lac 2, Avenue Hédi Nouira, Tunis',
          defaultLat: 36.8350,
          defaultLng: 10.2380,
        },
      },
    },
    include: { clientProfile: true },
  });

  const client2 = await prisma.user.create({
    data: {
      fullName: 'Amira Karoui',
      phoneNumber: '+21698123456',
      email: 'amira@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
      clientProfile: {
        create: {
          defaultAddress: 'Ennasr 2, Rue Habib Bourguiba, Tunis',
          defaultLat: 36.8500,
          defaultLng: 10.2000,
        },
      },
    },
    include: { clientProfile: true },
  });

  const client3 = await prisma.user.create({
    data: {
      fullName: 'Youssef Mansouri',
      phoneNumber: '+21655998877',
      email: 'youssef@example.com',
      passwordHash,
      role: UserRole.CLIENT,
      status: AccountStatus.ACTIVE,
      clientProfile: {
        create: {
          defaultAddress: 'El Menzah 6, Rue de la Liberté, Tunis',
          defaultLat: 36.8450,
          defaultLng: 10.1850,
        },
      },
    },
    include: { clientProfile: true },
  });
  console.log(`✅ 3 Clients seeded (${client1.fullName}, ${client2.fullName}, ${client3.fullName}).`);

  // 4. Seed Service Providers (Technicians)
  const provider1 = await prisma.user.create({
    data: {
      fullName: 'Ahmed Plombier',
      phoneNumber: '+21650111222',
      email: 'ahmed.plomberie@example.com',
      passwordHash,
      role: UserRole.PROVIDER,
      status: AccountStatus.ACTIVE,
      providerProfile: {
        create: {
          bio: 'Plombier certifié avec 10 ans d\'expérience dans le Grand Tunis.',
          radiusKm: 20.0,
          walletBalance: 150.0,
          isAvailable: true,
          currentLat: 36.8350,
          currentLng: 10.2380,
          ratingAverage: 4.9,
          totalRatings: 18,
          categories: {
            create: [{ categoryId: categories['Plomberie'].id }],
          },
        },
      },
    },
    include: { providerProfile: true },
  });

  const provider2 = await prisma.user.create({
    data: {
      fullName: 'Bilel Électricien',
      phoneNumber: '+21650333444',
      email: 'bilel.elec@example.com',
      passwordHash,
      role: UserRole.PROVIDER,
      status: AccountStatus.ACTIVE,
      providerProfile: {
        create: {
          bio: 'Spécialiste pannes électriques et haute tension.',
          radiusKm: 15.0,
          walletBalance: 80.0,
          isAvailable: true,
          currentLat: 36.8400,
          currentLng: 10.2200,
          ratingAverage: 4.7,
          totalRatings: 12,
          categories: {
            create: [
              { categoryId: categories['Électricité'].id },
              { categoryId: categories['Climatisation'].id },
            ],
          },
        },
      },
    },
    include: { providerProfile: true },
  });

  const provider3 = await prisma.user.create({
    data: {
      fullName: 'Karim Auto',
      phoneNumber: '+21650555666',
      email: 'karim.auto@example.com',
      passwordHash,
      role: UserRole.PROVIDER,
      status: AccountStatus.ACTIVE,
      providerProfile: {
        create: {
          bio: 'Dépannage mécanique et batterie sur place.',
          radiusKm: 25.0,
          walletBalance: 20.0,
          isAvailable: true,
          currentLat: 36.8200,
          currentLng: 10.1800,
          ratingAverage: 4.8,
          totalRatings: 9,
          categories: {
            create: [{ categoryId: categories['Mécanique'].id }],
          },
        },
      },
    },
    include: { providerProfile: true },
  });

  await prisma.user.create({
    data: {
      fullName: 'Sofiene Climatisation',
      phoneNumber: '+21650777888',
      email: 'sofiene.hvac@example.com',
      passwordHash,
      role: UserRole.PROVIDER,
      status: AccountStatus.PENDING_VERIFICATION,
      providerProfile: {
        create: {
          bio: 'Entretien, recharge fréon et installation clim.',
          radiusKm: 20.0,
          walletBalance: 0.0,
          isAvailable: false,
          currentLat: 36.8500,
          currentLng: 10.2000,
          ratingAverage: 0.0,
          totalRatings: 0,
          categories: {
            create: [{ categoryId: categories['Climatisation'].id }],
          },
        },
      },
    },
    include: { providerProfile: true },
  });

  // Sync Redis GEO
  await updateProviderGeoLocation(provider1.providerProfile!.id, 36.8350, 10.2380);
  await updateProviderGeoLocation(provider2.providerProfile!.id, 36.8400, 10.2200);
  await updateProviderGeoLocation(provider3.providerProfile!.id, 36.8200, 10.1800);
  console.log('✅ 4 Service Providers seeded with Redis GEO locations.');

  // 5. Seed Interventions / Missions across ALL states
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 180 * 60 * 1000);
  const ninetyMinsAgo = new Date(now.getTime() - 90 * 60 * 1000);

  // Mission 1: COMPLETED (Sami Ben Salah & Ahmed Plombier)
  const mission1 = await prisma.mission.create({
    data: {
      clientId: client1.clientProfile!.id,
      providerId: provider1.providerProfile!.id,
      categoryId: categories['Plomberie'].id,
      status: MissionStatus.COMPLETED,
      addressText: 'Lac 2, Avenue Hédi Nouira, Tunis',
      pickupLat: 36.8350,
      pickupLng: 10.2380,
      startedAt: oneHourAgo,
      completedAt: fifteenMinsAgo,
      commissionFee: 30.00,
    },
  });

  // Add Review for Mission 1
  await prisma.review.create({
    data: {
      missionId: mission1.id,
      clientId: client1.clientProfile!.id,
      providerId: provider1.providerProfile!.id,
      rating: 5,
      comment: 'Intervention très rapide, fuite de conduite réparée en 45min avec un grand professionnalisme !',
    },
  });

  // Mission 2: COMPLETED (Amira Karoui & Bilel Électricien)
  const mission2 = await prisma.mission.create({
    data: {
      clientId: client2.clientProfile!.id,
      providerId: provider2.providerProfile!.id,
      categoryId: categories['Électricité'].id,
      status: MissionStatus.COMPLETED,
      addressText: 'Ennasr 2, Rue Habib Bourguiba, Tunis',
      pickupLat: 36.8500,
      pickupLng: 10.2000,
      startedAt: threeHoursAgo,
      completedAt: ninetyMinsAgo,
      commissionFee: 30.00,
    },
  });

  await prisma.review.create({
    data: {
      missionId: mission2.id,
      clientId: client2.clientProfile!.id,
      providerId: provider2.providerProfile!.id,
      rating: 4,
      comment: 'Travail propre et soigné pour la panne de tableau électrique.',
    },
  });

  // Mission 3: IN_PROGRESS (Youssef Mansouri & Karim Auto)
  await prisma.mission.create({
    data: {
      clientId: client3.clientProfile!.id,
      providerId: provider3.providerProfile!.id,
      categoryId: categories['Mécanique'].id,
      status: MissionStatus.IN_PROGRESS,
      addressText: 'El Menzah 6, Rue de la Liberté, Tunis',
      pickupLat: 36.8450,
      pickupLng: 10.1850,
      startedAt: new Date(now.getTime() - 25 * 60 * 1000),
      commissionFee: 30.00,
    },
  });

  // Mission 4: EN_ROUTE (Sami Ben Salah & Ahmed Plombier)
  await prisma.mission.create({
    data: {
      clientId: client1.clientProfile!.id,
      providerId: provider1.providerProfile!.id,
      categoryId: categories['Plomberie'].id,
      status: MissionStatus.EN_ROUTE,
      addressText: 'Rue du Lac Biwa, Lac 1, Tunis',
      pickupLat: 36.8300,
      pickupLng: 10.2300,
      startedAt: new Date(now.getTime() - 10 * 60 * 1000),
      commissionFee: 30.00,
    },
  });

  // Mission 5: BROADCASTED (Amira Karoui)
  await prisma.mission.create({
    data: {
      clientId: client2.clientProfile!.id,
      categoryId: categories['Climatisation'].id,
      status: MissionStatus.BROADCASTED,
      addressText: 'Mutuelleville, Tunis',
      pickupLat: 36.8250,
      pickupLng: 10.1750,
      commissionFee: 30.00,
    },
  });

  // Mission 6: CANCELLED (Youssef Mansouri & Bilel Électricien)
  const mission6 = await prisma.mission.create({
    data: {
      clientId: client3.clientProfile!.id,
      providerId: provider2.providerProfile!.id,
      categoryId: categories['Électricité'].id,
      status: MissionStatus.CANCELLED,
      addressText: 'Ariana Centre, Tunis',
      pickupLat: 36.8600,
      pickupLng: 10.1900,
      cancellationReason: 'Le client ne répondait plus au téléphone lors de l\'arrivée du technicien.',
      commissionFee: 30.00,
    },
  });

  console.log('✅ 6 Interventions / Missions created across all lifecycle states.');

  // 6. Seed Bank Wire Top-up Transactions
  await prisma.topupTransaction.create({
    data: {
      providerId: provider3.providerProfile!.id,
      amount: 50.0,
      uniqueRef: 'TRF-2026-984021',
      receiptPhotoUrl: 'https://placeholder.co/receipt1.jpg',
      status: TransactionStatus.PENDING,
    },
  });

  await prisma.topupTransaction.create({
    data: {
      providerId: provider1.providerProfile!.id,
      amount: 100.0,
      uniqueRef: 'TRF-2026-104928',
      receiptPhotoUrl: 'https://placeholder.co/receipt2.jpg',
      status: TransactionStatus.APPROVED,
      validatedBy: admin.id,
    },
  });

  console.log('✅ 2 Bank wire top-up transactions seeded.');

  // 7. Seed Disputes & Reports
  await prisma.dispute.create({
    data: {
      missionId: mission6.id,
      reporterId: client3.id,
      reason: 'Le technicien a annulé l\'intervention subitement sans attendre mon arrivée.',
      status: 'OPEN',
    },
  });

  await prisma.dispute.create({
    data: {
      missionId: mission1.id,
      reporterId: client1.id,
      reason: 'Demande d\'explication concernant la vérification de la facture.',
      status: 'RESOLVED',
      resolutionNotes: 'Dossier examiné : tarification forfaitaire de 30 TND confirmée et conforme à la charte El 7al.',
    },
  });

  console.log('✅ 2 Disputes / Reports seeded.');

  console.log('\n🎉 Comprehensive test dataset execution completed successfully!');
  console.log('---------------------------------------------------------');
  console.log('🔑 Credentials summary for manual & automated testing:');
  console.log('👉 ADMIN: admin@el7al.com / adminel7al@2026');
  console.log('👉 CLIENT 1: sami@example.com / password123');
  console.log('👉 CLIENT 2: amira@example.com / password123');
  console.log('👉 PROVIDER 1: ahmed.plomberie@example.com / password123');
  console.log('👉 PROVIDER 2: bilel.elec@example.com / password123');
  console.log('---------------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during test dataset seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
