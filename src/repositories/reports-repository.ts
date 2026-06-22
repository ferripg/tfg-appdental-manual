import { prisma } from "./prisma-client";

export async function despesesPerProveidor(desDe?: Date, finsA?: Date) {
  const grups = await prisma.despesa.groupBy({
    by: ["proveidorId"],
    where: {
      ...(desDe || finsA
        ? {
            dataFactura: {
              ...(desDe ? { gte: desDe } : {}),
              ...(finsA ? { lte: finsA } : {}),
            },
          }
        : {}),
    },
    _sum: { import: true },
    _count: { _all: true },
    orderBy: { _sum: { import: "desc" } },
  });

  // groupBy només dóna l'id; busquem els noms a part
  const ids = grups
    .map((g) => g.proveidorId)
    .filter((id): id is string => id !== null);
  const proveidors = await prisma.proveidor.findMany({
    where: { id: { in: ids } },
    select: { id: true, nom: true },
  });
  const noms = new Map(proveidors.map((p) => [p.id, p.nom]));

  return grups.map((g) => ({
    proveidorId: g.proveidorId,
    nom: g.proveidorId ? (noms.get(g.proveidorId) ?? "—") : "(Sense proveïdor)",
    total: g._sum.import,
    comptador: g._count._all,
  }));
}
