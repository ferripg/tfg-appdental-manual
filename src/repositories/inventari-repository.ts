import { prisma } from "./prisma-client";
import type { Prisma, EstatInventari } from "@prisma/client";

export async function findAll(filters?: {
  search?: string;
  estat?: EstatInventari;
  proveidorId?: string;
}) {
  const { search, estat, proveidorId } = filters ?? {};
  return prisma.inventari.findMany({
    where: {
      ...(search
        ? { descripcio: { contains: search, mode: "insensitive" } }
        : {}),
      ...(estat ? { estat } : {}),
      ...(proveidorId ? { proveidorId } : {}),
    },
    include: { proveidor: true },
    orderBy: { dataAdquisicio: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.inventari.findUnique({
    where: { id },
    include: { proveidor: true, despesa: true },
  });
}

export async function create(data: Prisma.InventariCreateInput) {
  return prisma.inventari.create({ data });
}

export async function update(id: string, data: Prisma.InventariUpdateInput) {
  return prisma.inventari.update({ where: { id }, data });
}

export async function setEstat(
  id: string,
  estat: EstatInventari,
  anyBaixa: number | null,
) {
  return prisma.inventari.update({
    where: { id },
    data: { estat, anyBaixa },
  });
}

export async function remove(id: string) {
  return prisma.inventari.delete({ where: { id } });
}
