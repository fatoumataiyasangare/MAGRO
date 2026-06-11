/**
 * Script de nettoyage : supprime les comptes de test et leurs données
 * Usage: npx ts-node scripts/cleanup-fake-data.ts
 *        ou: node -e "require('./scripts/cleanup-fake-data')"
 */
import prisma from "../src/lib/prisma.js";

const FAKE_PHONES = [
  "+22370000001",
  "+22370000002", 
  "+22370000003",
  "+22370000004",
  "+22370000005",
];

async function cleanupFakeData() {
  console.log("🧹 Démarrage du nettoyage des fausses données...\n");

  // 1. Trouver les utilisateurs fake
  const fakeUsers = await prisma.user.findMany({
    where: { phone: { in: FAKE_PHONES } },
    select: { id: true, phone: true, name: true }
  });

  if (fakeUsers.length === 0) {
    console.log("✅ Aucun faux compte trouvé. La base de données est déjà propre !");
  } else {
    console.log(`Trouvé ${fakeUsers.length} faux compte(s) :`);
    fakeUsers.forEach(u => console.log(`  - ${u.phone} (${u.name})`));
  }

  // 2. Supprimer tous les listings liés aux faux users
  const fakeUserIds = fakeUsers.map(u => u.id);
  
  if (fakeUserIds.length > 0) {
    // Supprimer les commandes liées aux listings de ces users
    const listings = await prisma.listing.findMany({
      where: { farmerId: { in: fakeUserIds } },
      select: { id: true }
    });
    const listingIds = listings.map(l => l.id);
    
    if (listingIds.length > 0) {
      const deletedOrders = await prisma.order.deleteMany({
        where: { listingId: { in: listingIds } }
      });
      console.log(`\n🗑️  Supprimé ${deletedOrders.count} commande(s) liée(s) aux faux produits`);

      const deletedFavorites = await prisma.favorite.deleteMany({
        where: { listingId: { in: listingIds } }
      });
      console.log(`🗑️  Supprimé ${deletedFavorites.count} favori(s) liés aux faux produits`);

      const deletedListings = await prisma.listing.deleteMany({
        where: { farmerId: { in: fakeUserIds } }
      });
      console.log(`🗑️  Supprimé ${deletedListings.count} produit(s) des faux comptes`);
    } else {
      console.log("\n✅ Aucun produit fake à supprimer");
    }

    // 3. Supprimer les refresh tokens des faux users
    await prisma.refreshToken.deleteMany({
      where: { userId: { in: fakeUserIds } }
    });

    // 4. Supprimer les OTP des faux users
    await prisma.loginOtp.deleteMany({
      where: { phone: { in: FAKE_PHONES } }
    });

    // 5. Supprimer les faux users eux-mêmes
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: fakeUserIds } }
    });
    console.log(`🗑️  Supprimé ${deletedUsers.count} faux compte(s) utilisateur`);
  }

  // 6. Compter ce qui reste
  const remainingUsers = await prisma.user.count();
  const remainingListings = await prisma.listing.count();
  const remainingOrders = await prisma.order.count();

  console.log(`\n✅ Nettoyage terminé !`);
  console.log(`📊 État de la base de données :`);
  console.log(`   - Utilisateurs réels : ${remainingUsers}`);
  console.log(`   - Produits publiés : ${remainingListings}`);
  console.log(`   - Commandes : ${remainingOrders}`);

  await prisma.$disconnect();
}

cleanupFakeData().catch(err => {
  console.error("❌ Erreur lors du nettoyage :", err);
  prisma.$disconnect();
  process.exit(1);
});
