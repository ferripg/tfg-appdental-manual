import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll() {
  return prisma.despesa.findMany({
    include: { tipusDespesa: true, proveidor: true },
    orderBy: { dataFactura: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.despesa.findUnique({
    where: { id },
    include: { tipusDespesa: true, proveidor: true },
  });
}

export async function create(data: Prisma.DespesaCreateInput) {
  return prisma.despesa.create({
    data,
  });
}

export async function update(id: string, data: Prisma.DespesaUpdateInput) {
  return prisma.despesa.update({
    where: { id },
    data,
  });
}

export async function remove(id: string) {
  return prisma.despesa.delete({
    where: { id },
  });
}
