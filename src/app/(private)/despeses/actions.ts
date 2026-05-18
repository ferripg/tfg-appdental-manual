"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/get-session";
import { despesaSchema } from "@/schemas/despesa-schema";
import * as despesaService from "@/services/despeses-service";
import type { DespesaFormData } from "@/schemas/despesa-schema";
import type { Prisma } from "@prisma/client";

export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

function parseFormData(formData: FormData) {
  return {
    dataFactura: formData.get("dataFactura")?.toString().trim() ?? "",
    dataPagament: formData.get("dataPagament")?.toString().trim() ?? "",
    import: formData.get("import")?.toString().trim() ?? "",
    numFactura: formData.get("numFactura")?.toString().trim() ?? "",
    descripcio: formData.get("descripcio")?.toString().trim() ?? "",
    tipusDespesaId: formData.get("tipusDespesaId")?.toString().trim() ?? "",
    proveidorId: formData.get("proveidorId")?.toString().trim() ?? "",
  };
}

function cleanOptionals(data: DespesaFormData) {
  const result: Record<string, unknown> = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === "") result[key] = null;
  }
  return result;
}

export async function createDespesa(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = parseFormData(formData);
  const parsed = despesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const session = await getSession();
  if (!session) {
    return { message: "Has d'estar autenticat" };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    const dataAmbUserId = { ...cleaned, userId: session.user.id };
    await despesaService.crear(
      dataAmbUserId as unknown as Prisma.DespesaCreateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/despeses");
  redirect("/despeses");
}

export async function updateDespesa(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { message: "Has d'estar autenticat" };
  }

  const raw = parseFormData(formData);
  const parsed = despesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await despesaService.actualitzar(
      id,
      cleaned as unknown as Prisma.DespesaUpdateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/despeses");
  redirect("/despeses");
}

export async function deleteDespesa(id: string) {
  await requireSession();
  await despesaService.eliminar(id);
  revalidatePath("/despeses");
}
