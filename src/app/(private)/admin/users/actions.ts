"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { userCreateSchema, userUpdateSchema } from "@/schemas/user-schema";
import * as usersService from "@/services/users-service";
import type { Role } from "@prisma/client";

export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "ADMIN") return null;
  return session;
}

export async function createUser(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  if (!session) return { message: "No autoritzat" };

  const raw = {
    email: formData.get("email")?.toString().trim() ?? "",
    password: formData.get("password")?.toString() ?? "",
    name: formData.get("name")?.toString().trim() ?? "",
    role: formData.get("role")?.toString() ?? "",
  };

  const parsed = userCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  try {
    await usersService.crear({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
      role: parsed.data.role as Role,
    });
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?msg=creat");
}

export async function updateUser(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdmin();
  if (!session) return { message: "No autoritzat" };

  const raw = {
    email: formData.get("email")?.toString().trim() ?? "",
    name: formData.get("name")?.toString().trim() ?? "",
    role: formData.get("role")?.toString() ?? "",
  };

  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  if (session.user.id === id && parsed.data.role !== "ADMIN") {
    return {
      message: "No pots canviar el teu propi rol d'ADMIN (deixaries la app sense administrador)",
    };
  }

  try {
    await usersService.actualitzar(id, {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role as Role,
    });
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?msg=actualitzat");
}

export async function deactivateUser(id: string) {
  const session = await requireAdmin();
  if (!session) throw new Error("No autoritzat");

  if (session.user.id === id) {
    throw new Error("No pots desactivar-te a tu mateix");
  }

  await usersService.desactivar(id);
  revalidatePath("/admin/users");
}

export async function reactivateUser(id: string) {
  const session = await requireAdmin();
  if (!session) throw new Error("No autoritzat");

  await usersService.reactivar(id);
  revalidatePath("/admin/users");
  redirect("/admin/users?msg=reactivat");
}
