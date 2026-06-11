import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding admin users...");

  const admins = [
    {
      phone: "+22370000001",
      name: "Sékou (Super Admin)",
      role: "SUPER_ADMIN",
      email: "superadmin@magro.ml"
    },
    {
      phone: "+22370000002",
      name: "Fatoumata (Modératrice)",
      role: "MODERATOR",
      email: "moderator@magro.ml"
    },
    {
      phone: "+22370000003",
      name: "Amadou (Analyste)",
      role: "ANALYST",
      email: "analyst@magro.ml"
    }
  ];

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(`otp-only:${admin.phone}:${Date.now()}`, 12);
    
    await prisma.user.upsert({
      where: { phone: admin.phone },
      update: {
        name: admin.name,
        role: admin.role as any,
        email: admin.email
      },
      create: {
        phone: admin.phone,
        name: admin.name,
        role: admin.role as any,
        email: admin.email,
        passwordHash,
        region: "BAMAKO"
      }
    });
    console.log(`✅ Upserted ${admin.role} - Phone: ${admin.phone} (OTP: 123456)`);
  }

  console.log("Done seeding admins.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
