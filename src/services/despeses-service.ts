import * as despesesRepository from "@/repositories/despeses-repository";
import type { Prisma } from "@prisma/client";

export async function llistar() {
  return despesesRepository.findAll();
}

export async function obtenir(id: string) {
  return despesesRepository.findById(id);
}

export async function crear(data: Prisma.DespesaCreateInput) {
  return despesesRepository.create(data);
}

export async function actualitzar(id: string, data: Prisma.DespesaUpdateInput) {
  return despesesRepository.update(id, data);
}

export async function eliminar(id: string) {
  return despesesRepository.remove(id);
}
