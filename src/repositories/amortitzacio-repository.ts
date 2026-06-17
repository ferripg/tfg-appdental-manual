import { prisma } from "./prisma-client";
import type { Prisma } from "@prisma/client";

export async function findByExercici(exercici: number) {
  return prisma.amortitzacio.findMany({ where: { exercici } });
}

export async function upsert(
  inventariId: string,
  exercici: number,
  importAmort: Prisma.Decimal,
) {
  return prisma.amortitzacio.upsert({
    where: { inventariId_exercici: { inventariId, exercici } },
    create: { inventariId, exercici, import: importAmort },
    update: { import: importAmort },
  });
}

export async function deleteByExercici(exercici: number) {
  return prisma.amortitzacio.deleteMany({ where: { exercici } });
}

// Resum dels exercicis que tenen amortitzacions generades: any, total
// amortitzat i nombre de béns. Substitueix la taula TancamentExercici:
// l'estat es deriva directament de les amortitzacions existents.
export async function exercicisGenerats() {
  const grups = await prisma.amortitzacio.groupBy({
    by: ["exercici"],
    _sum: { import: true },
    _count: { _all: true },
    orderBy: { exercici: "desc" },
  });
  return grups.map((g) => ({
    exercici: g.exercici,
    total: g._sum.import,
    comptador: g._count._all,
  }));
}

// L'últim exercici amb amortitzacions generades (l'únic que es pot retrocedir).
export async function ultimExercici(): Promise<number | null> {
  const r = await prisma.amortitzacio.findFirst({
    orderBy: { exercici: "desc" },
    select: { exercici: true },
  });
  return r ? r.exercici : null;
}

export async function countByInventari(inventariId: string): Promise<number> {
  return prisma.amortitzacio.count({ where: { inventariId } });
}
