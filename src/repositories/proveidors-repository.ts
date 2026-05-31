import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll(filters?: {
  search?: string;
  includeInactius?: boolean;
}) {
  const { search, includeInactius } = filters ?? {};
  return prisma.proveidor.findMany({
    where: {
      ...(includeInactius ? {} : { actiu: true }),
      ...(search
        ? {
            OR: [
              { nom: { contains: search, mode: "insensitive" } },
              { nif: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ actiu: "desc" }, { nom: "asc" }],
  });
}

export async function findById(id: string) {
  return prisma.proveidor.findUnique({
    where: { id },
  });
}

export async function findByNif(nif: string) {
  return prisma.proveidor.findUnique({
    where: { nif },
  });
}

export async function create(data: Prisma.ProveidorCreateInput) {
  return prisma.proveidor.create({
    data,
  });
}

export async function update(id: string, data: Prisma.ProveidorUpdateInput) {
  return prisma.proveidor.update({
    where: { id },
    data,
  });
}

export async function softDelete(id: string) {
  return prisma.proveidor.update({
    where: { id },
    data: { actiu: false },
  });
}

export async function reactivate(id: string) {
  return prisma.proveidor.update({
    where: { id },
    data: { actiu: true },
  });
}
