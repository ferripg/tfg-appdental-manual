import { auth } from "@/lib/auth";
import * as usersRepository from "@/repositories/users-repository";
import type { Prisma, Role } from "@prisma/client";

export async function llistar(filters?: { search?: string }) {
  return usersRepository.findAll(filters);
}

export async function obtenir(id: string) {
  return usersRepository.findById(id);
}

export async function crear(data: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const result = await auth.api.createUser({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role as never,
      data: {
        mustChangePassword: true,
      },
    },
  });

  return result.user;
}

export async function actualitzar(id: string, data: Prisma.UserUpdateInput) {
  return usersRepository.update(id, data);
}

export async function desactivar(id: string) {
  return usersRepository.softDeactivate(id);
}

export async function reactivar(id: string) {
  return usersRepository.reactivate(id);
}
