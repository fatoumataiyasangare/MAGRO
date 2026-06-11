import prisma from "../src/lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, role: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  console.log("=== Users in database ===");
  for (const u of users) {
    console.log(`  ${u.role.padEnd(12)} | ${u.phone.padEnd(16)} | ${u.name} (${u.id.slice(0,8)})`);
  }
  console.log(`Total: ${users.length}`);
  await prisma.$disconnect();
}

main();
