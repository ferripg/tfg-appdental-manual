import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll(filters?: {
  search?: string;
  includeInactius?: boolean;
}) {
  const { search, includeInactius } = filters ?? {};
  return prisma.tipusDespesa.findMany({
    where: {
      ...(includeInactius ? {} : { actiu: true }),
      ...(search
        ? {
            OR: [
              { codi: { contains: search, mode: "insensitive" } },
              { descripcio: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ actiu: "desc" }, { codi: "asc" }],
  });
}

export async function findById(id: string) {
  return prisma.tipusDespesa.findUnique({
    where: { id },
  });
}

export async function findByCodi(codi: string) {
  return prisma.tipusDespesa.findUnique({
    where: { codi },
  });
}

export async function create(data: Prisma.TipusDespesaCreateInput) {
  return prisma.tipusDespesa.create({
    data,
  });
}

export async function update(id: string, data: Prisma.TipusDespesaUpdateInput) {
  return prisma.tipusDespesa.update({
    where: { id },
    data,
  });
}

export async function softDelete(id: string) {
  return prisma.tipusDespesa.update({
    where: { id },
    data: { actiu: false },
  });
}

export async function reactivate(id: string) {
  return prisma.tipusDespesa.update({
    where: { id },
    data: { actiu: true },
  });
}
