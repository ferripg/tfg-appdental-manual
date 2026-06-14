import * as dashboardRepository from "@/repositories/dashboard-repository";

// Rang de l'any actual: [1 gen, 1 gen de l'any que ve)
function rangAnyActual() {
  const any = new Date().getFullYear();
  return { any, desDe: new Date(any, 0, 1), finsA: new Date(any + 1, 0, 1) };
}

export async function dadesDashboard() {
  const { any, desDe, finsA } = rangAnyActual();

  // Les 3 queries en paral·lel (més ràpid que una rere l'altra)
  const [topRaw, perTipusRaw, despeses] = await Promise.all([
    dashboardRepository.topProveidors(5, desDe, finsA),
    dashboardRepository.despesesPerTipus(desDe, finsA),
    dashboardRepository.despesesDelRang(desDe, finsA),
  ]);

  const topProveidors = topRaw.map((p) => ({
    nom: p.nom,
    total: Number(p.total ?? 0),
  }));

  const perTipus = perTipusRaw.map((t) => ({
    nom: t.nom,
    total: Number(t.total ?? 0),
  }));

  // 12 barres buides (una per mes), i hi sumem cada despesa al seu mes
  const perMes = Array.from({ length: 12 }, (_, i) => ({
    mes: new Date(any, i, 1).toLocaleDateString("ca-ES", { month: "short" }),
    total: 0,
  }));
  for (const d of despeses) {
    perMes[new Date(d.dataFactura).getMonth()].total += Number(d.import);
  }

  const totalAny = perTipus.reduce((acc, t) => acc + t.total, 0);

  return { any, totalAny, topProveidors, perTipus, perMes };
}
