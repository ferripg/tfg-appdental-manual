"use server";

import { z } from "zod";
import { tipusDespesaSchema } from "@/schemas/tipus-despesa-schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as tipusDespesaService from "@/services/tipus-despesa-service";
import type { TipusDespesaFormData } from "@/schemas/tipus-despesa-schema";
import type { Prisma } from "@prisma/client";

export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

function parseFormData(formData: FormData) {
  return {
    codi: formData.get("codi")?.toString().trim() ?? "",
    descripcio: formData.get("descripcio")?.toString().trim() ?? "",
    deduible: formData.getAll("deduible").includes("on"),
    grup: formData.get("grup")?.toString().trim() ?? "",
    concepte: formData.get("concepte")?.toString().trim() ?? "",
    esAmortitzable: formData.getAll("esAmortitzable").includes("on"),
  };
}

function cleanOptionals(data: TipusDespesaFormData) {
  const result: Record<string, unknown> = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === "") result[key] = null;
  }
  return result;
}

export async function createTipusDespesa(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = parseFormData(formData);
  const parsed = tipusDespesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await tipusDespesaService.crear(
      cleaned as unknown as Prisma.TipusDespesaCreateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/tipus-despesa");
  redirect("/tipus-despesa");
}

export async function updateTipusDespesa(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = parseFormData(formData);
  const parsed = tipusDespesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await tipusDespesaService.actualitzar(
      id,
      cleaned as unknown as Prisma.TipusDespesaUpdateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/tipus-despesa");
  redirect("/tipus-despesa");
}

export async function deleteTipusDespesa(id: string) {
  await tipusDespesaService.eliminar(id);
  revalidatePath("/tipus-despesa");
}
