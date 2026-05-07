import { prisma } from "@/repositories/prisma-client";
import * as authService from "@/services/auth-service";
import { Role } from "@prisma/client";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL i SEED_ADMIN_PASSWORD són obligatoris al .env",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuari ${email} ja existeix, saltant.`);
    return;
  }

  await authService.createUser({
    email,
    password,
    name: "Admin",
    role: Role.ADMIN,
  });

  console.log(`Usuari admin creat: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
