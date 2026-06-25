import { prisma } from "./prisma-client";

export async function despesesDetallPerProveidor(desDe?: Date, finsA?: Date) {
  return prisma.despesa.findMany({
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
    select: {
      id: true,
      numFactura: true,
      dataFactura: true,
      descripcio: true,
      import: true,
      proveidor: { select: { id: true, nom: true, nif: true } },
      tipusDespesa: { select: { codi: true, descripcio: true } },
    },
    orderBy: [{ proveidor: { nom: "asc" } }, { dataFactura: "asc" }],
  });
}
