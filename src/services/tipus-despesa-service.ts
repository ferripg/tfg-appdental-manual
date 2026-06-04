import * as tipusDespesaRepository from "@/repositories/tipus-despesa-repository";
import * as despesesRepository from "@/repositories/despeses-repository";
import * as inventariService from "@/services/inventari-service";
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
  const tipus = await tipusDespesaRepository.update(id, data);

  // Retroactiu: si el tipus és amortitzable, generem els béns d'inventari per
  // a les despeses existents d'aquest tipus que encara no en tenen. És
  // idempotent (només crea els que falten). En try/catch perquè un error aquí
  // no ha de tombar l'actualització del tipus.
  if (tipus.esAmortitzable) {
    try {
      const despeses = await despesesRepository.findByTipusSenseInventari(id);
      for (const despesa of despeses) {
        await inventariService.generarBePerDespesa(despesa);
      }
    } catch (err) {
      console.error(
        "[tipus-despesa-service] Error generant béns retroactius:",
        err,
      );
    }
  }

  return tipus;
}

export async function eliminar(id: string) {
  return tipusDespesaRepository.softDelete(id);
}
