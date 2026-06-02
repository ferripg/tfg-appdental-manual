import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll(filters?: { search?: string }) {
  const { search } = filters ?? {};
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: [{ actiu: "desc" }, { name: "asc" }],
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user;
}

export async function update(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function softDeactivate(id: string) {
  return prisma.user.update({
    where: { id },
    data: { actiu: false },
  });
}

export async function deleteAllSessions(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}

export async function reactivate(id: string) {
  return prisma.user.update({
    where: { id },
    data: { actiu: true },
  });
}
