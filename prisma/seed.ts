import { auth } from "@/lib/auth";
import { prisma } from "@/repositories/prisma-client";
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

  // Better Auth crea User + Account + hash password
  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: "Admin",
    },
  });

  // Better Auth no permet definir camps custom al signUp (role, etc.)
  // Per això actualitzem després amb Prisma directe
  await prisma.user.update({
    where: { email },
    data: { role: Role.ADMIN },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
