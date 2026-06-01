import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPass = await bcrypt.hash("magro-dev-seed-2026", 12);

  // Create Farmer user
  const farmer = await prisma.user.upsert({
    where: { phone: "+22370000001" },
    update: {},
    create: {
      phone: "+22370000001",
      name: "Amadou Traoré",
      passwordHash: hashedPass,
      role: "FARMER",
      region: "Sikasso",
      isVerified: true,
      isPremium: false
    }
  });

  // Create Buyer user
  const buyer = await prisma.user.upsert({
    where: { phone: "+22370000002" },
    update: {},
    create: {
      phone: "+22370000002",
      name: "Fatoumata Keita",
      passwordHash: hashedPass,
      role: "BUYER",
      region: "Bamako",
      buyerType: "TRADER",
      isVerified: false,
      isPremium: true
    }
  });

  // Create Expert user
  const expert = await prisma.user.upsert({
    where: { phone: "+22370000003" },
    update: {},
    create: {
      phone: "+22370000003",
      name: "Dr. Ibrahim CAA",
      passwordHash: hashedPass,
      role: "EXPERT",
      region: "Bamako",
      isVerified: true
    }
  });

  // Create Moderator user
  const moderator = await prisma.user.upsert({
    where: { phone: "+22370000004" },
    update: {},
    create: {
      phone: "+22370000004",
      name: "Modérateur MAGRO",
      passwordHash: hashedPass,
      role: "MODERATOR",
      region: "Bamako",
      isVerified: true
    }
  });

  // Create Industrial Buyer
  const industry = await prisma.user.upsert({
    where: { phone: "+22370000005" },
    update: {},
    create: {
      phone: "+22370000005",
      name: "Grands Moulins du Mali",
      passwordHash: hashedPass,
      role: "BUYER",
      region: "Bamako",
      buyerType: "INDUSTRY",
      isVerified: true,
      isPremium: true
    }
  });

  // Seed Listings
  const listing1 = await prisma.listing.upsert({
    where: { id: "listing-seed-1" },
    update: {},
    create: {
      id: "listing-seed-1",
      title: "Tomates fraîches",
      description: "Tomates cultivées de manière écologique, récoltées ce matin.",
      price: 750,
      quantity: 500,
      quantityRemaining: 500,
      region: "Sikasso",
      image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
      farmerId: farmer.id
    }
  });

  const listing2 = await prisma.listing.upsert({
    where: { id: "listing-seed-2" },
    update: {},
    create: {
      id: "listing-seed-2",
      title: "Oignons blancs",
      description: "Oignons de qualité supérieure disponibles en gros.",
      price: 500,
      quantity: 800,
      quantityRemaining: 800,
      region: "Kayes",
      image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
      farmerId: farmer.id
    }
  });

  // Seed active Gold Certification for Tomates
  await prisma.certification.upsert({
    where: { id: "cert-seed-1" },
    update: {},
    create: {
      id: "cert-seed-1",
      farmerId: farmer.id,
      expertId: expert.id,
      cropName: "Tomates fraîches",
      score: 87,
      badgeLevel: "GOLD",
      criteriaDetail: {
        aspect: 27,
        brix: 22,
        hygiene: 18,
        practices: 12,
        traceability: 8
      },
      reportUrl: "https://magro.ml/reports/cert-seed-1.pdf",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: "ACTIVE"
    }
  });

  // Seed a pending verification request for buyer
  await prisma.verificationRequest.upsert({
    where: { id: "ver-seed-1" },
    update: {},
    create: {
      id: "ver-seed-1",
      userId: buyer.id,
      documents: {
        identityCardUrl: "CNI_Fatoumata_Keita.jpg",
        gpsCoordinates: "12.6392° N, 8.0029° W"
      },
      status: "PENDING"
    }
  });

  // Seed a sample order
  const order1 = await prisma.order.upsert({
    where: { id: "order-seed-1" },
    update: {},
    create: {
      id: "order-seed-1",
      buyerId: buyer.id,
      listingId: listing1.id,
      quantity: 50,
      totalPrice: 37500,
      status: "CONFIRMEE",
      paymentStatus: "ESCROW",
      depositRequired: false,
      riskScore: 12
    }
  });

  // Seed a pending seasonal contract from industry to farmer
  await prisma.seasonalContract.upsert({
    where: { id: "contract-seed-1" },
    update: {},
    create: {
      id: "contract-seed-1",
      buyerId: industry.id,
      farmerId: farmer.id,
      cropName: "Tomates fraîches",
      totalQuantityKg: 25000,
      pricePerKg: 700,
      seasonStart: new Date("2026-06-01"),
      seasonEnd: new Date("2026-11-30"),
      deliverySchedule: { type: "mensuel", details: "5000 kg par mois" },
      status: "PENDING"
    }
  });

  console.log("✅ MAGRO Seed complete:");
  console.log(`  Farmers: ${farmer.name} (+22370000001)`);
  console.log(`  Buyers: ${buyer.name} (+22370000002), ${industry.name} (+22370000005)`);
  console.log(`  Expert: ${expert.name} (+22370000003)`);
  console.log(`  Moderator: ${moderator.name} (+22370000004)`);
  console.log(`  Listings: ${listing1.title}, ${listing2.title}`);
  console.log(`  Certification: Badge OR pour Tomates fraîches (score 87/100)`);
  console.log(`  Contrat Saisonnier: GMM → ${farmer.name} (25t Tomates)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
