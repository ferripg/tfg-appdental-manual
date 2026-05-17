"use server";

import { z } from "zod";
import { proveidorSchema } from "@/schemas/proveidor-schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as proveidorsService from "@/services/proveidors-service";
import type { ProveidorFormData } from "@/schemas/proveidor-schema";
import type { Prisma } from "@prisma/client";

export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

function parseFormData(formData: FormData) {
  return {
    nif: formData.get("nif")?.toString().trim() ?? "",
    nom: formData.get("nom")?.toString().trim() ?? "",
    codiBis: formData.get("codiBis")?.toString().trim() ?? "",
    adreca: formData.get("adreca")?.toString().trim() ?? "",
    codiPostal: formData.get("codiPostal")?.toString().trim() ?? "",
    poblacio: formData.get("poblacio")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    telefon: formData.get("telefon")?.toString().trim() ?? "",
    personaContacte: formData.get("personaContacte")?.toString().trim() ?? "",
    iban: formData.get("iban")?.toString().trim() ?? "",
    notes: formData.get("notes")?.toString().trim() ?? "",
  };
}

function cleanOptionals(data: ProveidorFormData) {
  const result: Record<string, string | undefined> = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === "") result[key] = undefined;
  }
  return result;
}

export async function createProveidor(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = parseFormData(formData);
  const parsed = proveidorSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await proveidorsService.crear(
      cleaned as unknown as Prisma.ProveidorCreateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/proveidors");
  redirect("/proveidors");
}

export async function updateProveidor(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = parseFormData(formData);
  const parsed = proveidorSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await proveidorsService.actualitzar(
      id,
      cleaned as unknown as Prisma.ProveidorUpdateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/proveidors");
  redirect("/proveidors");
}

export async function deleteProveidor(id: string) {
  await proveidorsService.eliminar(id);
  revalidatePath("/proveidors");
}
