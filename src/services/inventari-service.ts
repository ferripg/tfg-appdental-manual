import * as inventariRepository from "@/repositories/inventari-repository";
import type { Prisma, EstatInventari } from "@prisma/client";

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

export async function crear(data: Prisma.InventariCreateInput) {
  return inventariRepository.create(data);
}

export async function actualitzar(id: string, data: Prisma.InventariUpdateInput) {
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
  // PENDENT MAN-18: protegir béns amb amortitzacions (no s'han de poder esborrar).
  return inventariRepository.remove(id);
}
