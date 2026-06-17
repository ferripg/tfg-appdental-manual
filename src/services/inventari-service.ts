import * as inventariRepository from "@/repositories/inventari-repository";
import type { Despesa, Prisma, EstatInventari } from "@prisma/client";

// Genera un bé d'inventari a partir d'una despesa amortitzable. El % es crea
// a 0 (l'usuari l'edita després). Reutilitzat per l'auto-create (al crear la
// despesa) i pel retroactiu (al marcar un tipus com a amortitzable).
export async function generarBePerDespesa(despesa: Despesa) {
  const numInventari = await inventariRepository.nextNumInventari();
  return inventariRepository.create({
    numInventari,
    descripcio: despesa.descripcio ?? despesa.numFactura ?? "Bé amortitzable",
    dataAdquisicio: despesa.dataFactura,
    importAdquisicio: despesa.import,
    percAmortitzacio: 0,
    numFactura: despesa.numFactura,
    proveidorId: despesa.proveidorId,
    despesaId: despesa.id,
  } as unknown as Prisma.InventariCreateInput);
}

export async function llistar(filters?: {
  search?: string;
  estat?: EstatInventari;
  proveidorId?: string;
}) {
  return inventariRepository.findAll(filters);
}

export async function obtenir(id: string) {
  return inventariRepository.findById(id);
}

export async function actualitzar(
  id: string,
  data: Prisma.InventariUpdateInput,
) {
  return inventariRepository.update(id, data);
}

export async function donarDeBaixa(id: string) {
  return inventariRepository.setEstat(id, "BAIXA", new Date().getFullYear());
}

export async function reactivar(id: string) {
  return inventariRepository.setEstat(id, "ACTIU", null);
}

export async function eliminar(id: string) {
  // Hard delete: l'esborrem de debò. La "baixa" (reversible) cobreix el cas
  // d'errors o béns fora de circulació; eliminar és definitiu.
  // PENDENT MAN-24: protegir béns amb amortitzacions (no s'han de poder esborrar).
  return inventariRepository.remove(id);
}

export async function obtenirPerDespesa(despesaId: string) {
  return inventariRepository.findByDespesaId(despesaId);
}
