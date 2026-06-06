import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findAll(filters?: {
  search?: string;
  desDe?: Date;
  finsA?: Date;
  proveidorId?: string;
  tipusId?: string;
}) {
  const { search, desDe, finsA, proveidorId, tipusId } = filters ?? {};
  return prisma.despesa.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { numFactura: { contains: search, mode: "insensitive" } },
              { descripcio: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(desDe || finsA
        ? {
            dataFactura: {
              ...(desDe ? { gte: desDe } : {}),
              ...(finsA ? { lte: finsA } : {}),
            },
          }
        : {}),
      ...(proveidorId ? { proveidorId } : {}),
      ...(tipusId ? { tipusDespesaId: tipusId } : {}),
    },
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

// Despeses d'un tipus que encara no tenen bé d'inventari associat. S'usa per
// generar els béns retroactivament quan un tipus es marca com a amortitzable.
export async function findByTipusSenseInventari(tipusId: string) {
  return prisma.despesa.findMany({
    where: { tipusDespesaId: tipusId, inventari: null },
  });
}

// Any de la despesa més antiga registrada (primer exercici a tancar).
export async function anyDespesaMesAntiga(): Promise<number | null> {
  const d = await prisma.despesa.findFirst({
    orderBy: { dataFactura: "asc" },
    select: { dataFactura: true },
  });
  return d ? d.dataFactura.getFullYear() : null;
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
