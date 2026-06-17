import * as despesesRepository from "@/repositories/despeses-repository";
import * as tipusDespesaRepository from "@/repositories/tipus-despesa-repository";
import * as inventariService from "@/services/inventari-service";
import { deleteFactura } from "@/services/minio-service";
import type { Prisma } from "@prisma/client";

export async function llistar(filters?: {
  search?: string;
  desDe?: Date;
  finsA?: Date;
  proveidorId?: string;
  tipusId?: string;
  importMin?: number;
  importMax?: number;
}) {
  return despesesRepository.findAll(filters);
}

export async function exercicisAmbDespeses() {
  return despesesRepository.anysAmbDespeses();
}

export async function obtenir(id: string) {
  return despesesRepository.findById(id);
}

export async function crear(data: Prisma.DespesaCreateInput) {
  const despesa = await despesesRepository.create(data);

  try {
    const tipus = await tipusDespesaRepository.findById(despesa.tipusDespesaId);
    if (tipus?.esAmortitzable) {
      await inventariService.generarBePerDespesa(despesa);
    }
  } catch (err) {
    console.error(
      "[despeses-service] Error generant el bé d'inventari automàtic:",
      err,
    );
  }

  return despesa;
}

export async function actualitzar(id: string, data: Prisma.DespesaUpdateInput) {
  if (data.fitxerKey !== undefined) {
    const existent = await despesesRepository.findById(id);
    if (existent?.fitxerKey && existent.fitxerKey !== data.fitxerKey) {
      try {
        await deleteFactura(existent.fitxerKey);
      } catch (err) {
        console.error("Error eliminant fitxer antic de MinIO:", err);
      }
    }
  }
  return despesesRepository.update(id, data);
}

export async function eliminar(id: string) {
  const despesa = await despesesRepository.findById(id);
  const beAssociat = await inventariService.obtenirPerDespesa(id);
  if (beAssociat) {
    throw new Error(
      "No es pot eliminar la despesa: té un bé d'inventari associat. Elimina primer el bé.",
    );
  }
  if (despesa?.fitxerKey) {
    try {
      await deleteFactura(despesa.fitxerKey);
    } catch (err) {
      console.error("Error eliminant fitxer de MinIO:", err);
    }
  }
  return despesesRepository.remove(id);
}
