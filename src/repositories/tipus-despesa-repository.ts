import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll() {
  return prisma.tipusDespesa.findMany({
    where: { actiu: true },
    orderBy: { codi: "asc" },
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
