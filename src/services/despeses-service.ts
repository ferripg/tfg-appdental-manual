import * as despesesRepository from "@/repositories/despeses-repository";
import { deleteFactura } from "@/services/minio-service";
import type { Prisma } from "@prisma/client";

export async function llistar(filters?: {
  search?: string;
  desDe?: Date;
  finsA?: Date;
  proveidorId?: string;
  tipusId?: string;
}) {
  return despesesRepository.findAll(filters);
}

export async function obtenir(id: string) {
  return despesesRepository.findById(id);
}

export async function crear(data: Prisma.DespesaCreateInput) {
  return despesesRepository.create(data);
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
  if (despesa?.fitxerKey) {
    try {
      await deleteFactura(despesa.fitxerKey);
    } catch (err) {
      console.error("Error eliminant fitxer de MinIO:", err);
    }
  }
  return despesesRepository.remove(id);
}
