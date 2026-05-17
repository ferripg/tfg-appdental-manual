import * as proveidorsRepository from "@/repositories/proveidors-repository";
import type { Prisma } from "@prisma/client";

export async function llistar() {
  return proveidorsRepository.findAll();
}

export async function obtenir(id: string) {
  return proveidorsRepository.findById(id);
}

export async function crear(data: Prisma.ProveidorCreateInput) {
  const existeix = await proveidorsRepository.findByNif(data.nif);
  if (existeix) {
    throw new Error(`Ja existeix un proveidor amb NIF ${data.nif}`);
  } else {
    return proveidorsRepository.create(data);
  }
}

export async function actualitzar(
  id: string,
  data: Prisma.ProveidorUpdateInput,
) {
  if (data.nif && typeof data.nif == "string") {
    const existeix = await proveidorsRepository.findByNif(data.nif);
    if (existeix && existeix.id !== id) {
      throw new Error(`Ja existeix un proveidor amb NIF ${data.nif}`);
    }
  }
  return proveidorsRepository.update(id, data);
}

export async function eliminar(id: string) {
  return proveidorsRepository.softDelete(id);
}
