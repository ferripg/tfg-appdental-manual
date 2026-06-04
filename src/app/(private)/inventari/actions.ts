"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireSession } from "@/lib/get-session";
import { inventariSchema } from "@/schemas/inventari-schema";
import * as inventariService from "@/services/inventari-service";
import type { InventariFormData } from "@/schemas/inventari-schema";
import type { Prisma } from "@prisma/client";

export type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

function parseFormData(formData: FormData) {
  return {
    descripcio: formData.get("descripcio")?.toString().trim() ?? "",
    dataAdquisicio: formData.get("dataAdquisicio")?.toString().trim() ?? "",
    importAdquisicio: formData.get("importAdquisicio")?.toString().trim() ?? "",
    percAmortitzacio: formData.get("percAmortitzacio")?.toString().trim() ?? "",
    numFactura: formData.get("numFactura")?.toString().trim() ?? "",
    proveidorId: formData.get("proveidorId")?.toString().trim() ?? "",
  };
}

function cleanOptionals(data: InventariFormData) {
  const result: Record<string, unknown> = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === "") result[key] = null;
  }
  return result;
}

export async function updateInventari(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { message: "Has d'estar autenticat" };
  }

  const raw = parseFormData(formData);
  const parsed = inventariSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const cleaned = cleanOptionals(parsed.data);
    await inventariService.actualitzar(
      id,
      cleaned as unknown as Prisma.InventariUpdateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/inventari");
  redirect("/inventari?msg=actualitzat");
}

export async function baixaInventari(id: string) {
  await requireSession();
  await inventariService.donarDeBaixa(id);
  revalidatePath("/inventari");
  redirect("/inventari?msg=baixa");
}

export async function reactivarInventari(id: string) {
  await requireSession();
  await inventariService.reactivar(id);
  revalidatePath("/inventari");
  redirect("/inventari?msg=reactivat");
}

// Sense redirect: el DeleteEntityButton gestiona el toast al client.
export async function eliminarInventari(id: string) {
  await requireSession();
  await inventariService.eliminar(id);
  revalidatePath("/inventari");
}
