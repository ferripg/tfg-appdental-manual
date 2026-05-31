import * as tipusDespesaRepository from "@/repositories/tipus-despesa-repository";
import type { Prisma } from "@prisma/client";

export async function llistar(filters?: {
  search?: string;
  includeInactius?: boolean;
}) {
  return tipusDespesaRepository.findAll(filters);
}

export async function reactivar(id: string) {
  return tipusDespesaRepository.reactivate(id);
}

export async function obtenir(id: string) {
  return tipusDespesaRepository.findById(id);
}

export async function crear(data: Prisma.TipusDespesaCreateInput) {
  const existeix = await tipusDespesaRepository.findByCodi(data.codi);
  if (existeix) {
    if (!existeix.actiu) {
      return tipusDespesaRepository.update(existeix.id, {
        ...data,
        actiu: true,
      });
    }
    throw new Error(`Ja existeix un tipus de despesa amb codi ${data.codi}`);
  }
  return tipusDespesaRepository.create(data);
}

export async function actualitzar(
  id: string,
  data: Prisma.TipusDespesaUpdateInput,
) {
  if (data.codi && typeof data.codi === "string") {
    const existeix = await tipusDespesaRepository.findByCodi(data.codi);
    if (existeix && existeix.id !== id) {
      throw new Error(`Ja existeix un tipus de despesa amb codi ${data.codi}`);
    }
  }
  return tipusDespesaRepository.update(id, data);
}

export async function eliminar(id: string) {
  return tipusDespesaRepository.softDelete(id);
}
