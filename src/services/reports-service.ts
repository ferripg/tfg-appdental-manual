import * as reportsRepository from "@/repositories/reports-repository";

export async function informeProveidors(filters?: {
  desDe?: Date;
  finsA?: Date;
}) {
  const { desDe, finsA } = filters ?? {};
  const files = await reportsRepository.despesesPerProveidor(desDe, finsA);

  // Decimal → number (poder passar-ho a un Client Component)
  const base = files.map((f) => ({
    proveidorId: f.proveidorId,
    nom: f.nom,
    total: Number(f.total ?? 0),
    comptador: f.comptador,
  }));

  const totalGeneral = base.reduce((acc, r) => acc + r.total, 0);

  // % sobre el total
  const rows = base.map((r) => ({
    ...r,
    percentatge: totalGeneral > 0 ? (r.total / totalGeneral) * 100 : 0,
  }));

  return { rows, totalGeneral };
}
