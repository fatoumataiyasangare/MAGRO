import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const farmer = await prisma.user.upsert({
    where: { phone: "+22370000001" },
    update: {},
    create: {
      phone: "+22370000001",
      name: "Ali",
      role: "FARMER"
    }
  });

  await prisma.listing.upsert({
    where: { id: "listing-1" },
    update: {},
    create: {
      id: "listing-1",
      title: "Tomates bio fraîches",
      description: "Tomates récoltées ce matin, sans pesticides.",
      price: 650,
      quantity: 850,
      region: "Bamako",
      image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
      farmerId: farmer.id
    }
  });

  await prisma.listing.upsert({
    where: { id: "listing-2" },
    update: {},
    create: {
      id: "listing-2",
      title: "Oignons rouges",
      description: "Oignons locaux de qualité, disponibles en gros.",
      price: 320,
      quantity: 420,
      region: "Sikasso",
      image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
      farmerId: farmer.id
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
