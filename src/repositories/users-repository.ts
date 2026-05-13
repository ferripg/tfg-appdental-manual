import { prisma } from "./prisma-client";

export async function findByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}
