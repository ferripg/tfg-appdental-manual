import { prisma } from "./prisma-client";

export async function topProveidors(limit: number, desDe: Date, finsA: Date) {
  // Agrupa+suma a la BD: una fila per proveïdor amb el seu total
  const grouped = await prisma.despesa.groupBy({
    by: ["proveidorId"],
    where: {
      dataFactura: { gte: desDe, lt: finsA },
      proveidorId: { not: null },
    },
    _sum: { import: true },
    orderBy: { _sum: { import: "desc" } }, // de més gastat a menys
    take: limit, // només els N primers
  });

  // busquem els noms i els ajuntem amb un Map
  const ids = grouped
    .map((g) => g.proveidorId)
    .filter((id): id is string => id !== null);
  const proveidors = await prisma.proveidor.findMany({
    where: { id: { in: ids } },
    select: { id: true, nom: true },
  });
  const nomById = new Map(proveidors.map((p) => [p.id, p.nom]));

  return grouped.map((g) => ({
    nom: nomById.get(g.proveidorId as string) ?? "—",
    total: g._sum.import,
  }));
}

export async function despesesPerTipus(desDe: Date, finsA: Date) {
  const grouped = await prisma.despesa.groupBy({
    by: ["tipusDespesaId"],
    where: { dataFactura: { gte: desDe, lt: finsA } },
    _sum: { import: true },
    orderBy: { _sum: { import: "desc" } },
  });

  const ids = grouped.map((g) => g.tipusDespesaId);
  const tipus = await prisma.tipusDespesa.findMany({
    where: { id: { in: ids } },
    select: { id: true, descripcio: true },
  });
  const nomById = new Map(tipus.map((t) => [t.id, t.descripcio]));

  return grouped.map((g) => ({
    nom: nomById.get(g.tipusDespesaId) ?? "—",
    total: g._sum.import,
  }));
}

export async function despesesDelRang(desDe: Date, finsA: Date) {
  return prisma.despesa.findMany({
    where: { dataFactura: { gte: desDe, lt: finsA } },
    select: { dataFactura: true, import: true },
  });
}
