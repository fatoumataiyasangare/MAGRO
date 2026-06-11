import { PrismaClient, UserRole, BuyerType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seed (amorçage) de la base de données MAGRO...');

  // 1. Nettoyer la base (ordre inverse des dépendances pour éviter les erreurs de clés étrangères)
  await prisma.auditLog.deleteMany();
  await prisma.transportNegotiation.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.order.deleteMany();
  await prisma.availabilityAlert.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.seasonalContract.deleteMany();
  await prisma.trustedPair.deleteMany();
  await prisma.cooperativeMember.deleteMany();
  await prisma.loginOtp.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Hash standard pour les mots de passe de test (123456)
  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. Création des Agriculteurs (FARMERS)
  const farmer1 = await prisma.user.create({
    data: {
      phone: '+22370000001',
      name: 'Amadou Traoré',
      passwordHash,
      role: UserRole.FARMER,
      region: 'Sikasso',
      isVerified: true,
      rating: 4.8,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      phone: '+22370000002',
      name: 'Oumar Kéita',
      passwordHash,
      role: UserRole.FARMER,
      region: 'Koulikoro',
      isVerified: false,
      rating: 4.5,
    },
  });

  // 3. Création des Acheteurs (BUYERS)
  const buyer1 = await prisma.user.create({
    data: {
      phone: '+22370000003',
      name: 'Fatoumata K.',
      passwordHash,
      role: UserRole.BUYER,
      buyerType: BuyerType.TRADER,
      region: 'Bamako',
      isVerified: true,
      rating: 4.9,
    },
  });

  console.log('✅ Utilisateurs créés.');

  // 5. Création des Produits (Listings)
  const listing1 = await prisma.listing.create({
    data: {
      title: 'Tomates Fraîches',
      description: 'Belles tomates de la région de Sikasso',
      price: 350,
      quantity: 500,
      quantityRemaining: 500,
      unit: 'kg',
      region: 'Sikasso',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/800px-Tomato_je.jpg',
      farmerId: farmer1.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: 'Oignons Blancs',
      description: 'Oignons de conservation, très bonne qualité.',
      price: 250,
      quantity: 1000,
      quantityRemaining: 1000,
      unit: 'kg',
      region: 'Koulikoro',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/800px-Onion_on_White.JPG',
      farmerId: farmer2.id,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: 'Mangues Kent',
      description: 'Mangues douces pour exportation.',
      price: 1500,
      quantity: 300,
      quantityRemaining: 300,
      unit: 'kg',
      region: 'Sikasso',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/800px-Hapus_Mango.jpg',
      farmerId: farmer1.id,
    },
  });

  console.log('✅ Produits (Listings) créés.');

  // 6. Création des Commandes (Orders)
  await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      listingId: listing1.id,
      quantity: 50,
      totalPrice: 50 * 350,
      status: 'EN_ATTENTE',
      paymentStatus: 'ESCROW', // Paiement séquestré
    },
  });

  await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      listingId: listing2.id,
      quantity: 100,
      totalPrice: 100 * 250,
      status: 'CONFIRMEE',
      paymentStatus: 'ESCROW',
    },
  });

  console.log('✅ Commandes (Orders) créées.');

  console.log('🎉 Seed terminé avec succès ! Votre base Supabase est prête.');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
