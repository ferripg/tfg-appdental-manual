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

export async function nextNumInventari(): Promise<string> {
  const last = await prisma.inventari.findFirst({
    where: { numInventari: { not: null } },
    orderBy: { numInventari: "desc" },
    select: { numInventari: true },
  });
  const lastNum = last?.numInventari
    ? parseInt(last.numInventari.replace(/\D/g, ""), 10)
    : 0;
  return `INV-${String(lastNum + 1).padStart(4, "0")}`;
}

// Béns que poden amortitzar: actius, amb percentatge > 0 i adquirits durant
// l'exercici que es tanca o abans (un bé del 2026 no s'amortitza al tancar 2025).
export async function findAmortitzables(finsExercici: number) {
  return prisma.inventari.findMany({
    where: {
      estat: "ACTIU",
      percAmortitzacio: { gt: 0 },
      dataAdquisicio: { lt: new Date(`${finsExercici + 1}-01-01`) },
    },
  });
}

export async function updateAmortitzacio(
  id: string,
  importAmortitzat: Prisma.Decimal,
  importUltimaAmort: Prisma.Decimal | null,
) {
  return prisma.inventari.update({
    where: { id },
    data: { importAmortitzat, importUltimaAmort },
  });
}

export async function findByDespesaId(despesaId: string) {
  return prisma.inventari.findUnique({ where: { despesaId } });
}
