import * as reportsRepository from "@/repositories/reports-repository";

type DespesaDetall = {
  id: string;
  numFactura: string | null;
  data: string;
  concepte: string | null;
  tipus: string;
  import: number;
};

type GrupProveidor = {
  nom: string;
  nif: string | null;
  despeses: DespesaDetall[];
  subtotal: number;
};

function formatData(d: Date) {
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getUTCFullYear()}`;
}

export async function informeProveidors(filters?: {
  desDe?: Date;
  finsA?: Date;
}) {
  const { desDe, finsA } = filters ?? {};
  const despeses = await reportsRepository.despesesDetallPerProveidor(
    desDe,
    finsA,
  );

  // Agrupar per proveïdor (l'ordre alfabètic ja ve de la BD)
  const grups = new Map<string, GrupProveidor>();
  for (const d of despeses) {
    const clau = d.proveidor?.id ?? "__sense__";
    if (!grups.has(clau)) {
      grups.set(clau, {
        nom: d.proveidor?.nom ?? "(Sense proveïdor)",
        nif: d.proveidor?.nif ?? null,
        despeses: [],
        subtotal: 0,
      });
    }
    const grup = grups.get(clau)!;
    const imp = Number(d.import);
    grup.despeses.push({
      id: d.id,
      numFactura: d.numFactura,
      data: formatData(d.dataFactura),
      concepte: d.descripcio,
      tipus: `${d.tipusDespesa.codi} — ${d.tipusDespesa.descripcio}`,
      import: imp,
    });
    grup.subtotal += imp;
  }

  const proveidors = [...grups.values()];
  const totalGeneral = proveidors.reduce((acc, p) => acc + p.subtotal, 0);

  return { proveidors, totalGeneral };
}
