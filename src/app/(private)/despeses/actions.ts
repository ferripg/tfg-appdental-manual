"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPermission } from "@/lib/get-session";
import { despesaSchema } from "@/schemas/despesa-schema";
import * as despesaService from "@/services/despeses-service";
import * as auditService from "@/services/audit-service";
import { getPresignedUrl, uploadFactura } from "@/services/minio-service";
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

async function handleFileUpload(
  formData: FormData,
): Promise<{ fitxerKey: string | null; error?: string }> {
  const file = formData.get("factura") as File | null;
  if (!file || file.size === 0) return { fitxerKey: null };

  if (file.type !== "application/pdf") {
    return { fitxerKey: null, error: "Només es permeten fitxers PDF" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { fitxerKey: null, error: "El fitxer no pot superar 5MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fitxerKey = await uploadFactura(buffer, file.name, file.type);
  return { fitxerKey };
}

export async function createDespesa(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const perm = await checkPermission("despesa", "create");
  if (!perm.ok) return { message: perm.message };

  const raw = parseFormData(formData);
  const parsed = despesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { fitxerKey, error: fileError } = await handleFileUpload(formData);
  if (fileError) return { message: fileError };

  try {
    const cleaned = cleanOptionals(parsed.data);
    const dataAmbUserId = {
      ...cleaned,
      userId: perm.session.user.id,
      fitxerKey,
    };
    await despesaService.crear(
      dataAmbUserId as unknown as Prisma.DespesaCreateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/despeses");
  redirect("/despeses?msg=creat");
}

export async function updateDespesa(
  id: string,
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const perm = await checkPermission("despesa", "update");
  if (!perm.ok) return { message: perm.message };

  const raw = parseFormData(formData);
  const parsed = despesaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      message: "Hi ha errors al formulari",
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { fitxerKey, error: fileError } = await handleFileUpload(formData);
  if (fileError) return { message: fileError };

  try {
    const cleaned = cleanOptionals(parsed.data);
    const updateData = fitxerKey ? { ...cleaned, fitxerKey } : cleaned;
    await despesaService.actualitzar(
      id,
      updateData as unknown as Prisma.DespesaUpdateInput,
    );
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Error desconegut" };
  }

  revalidatePath("/despeses");
  redirect("/despeses?msg=actualitzat");
}

export async function deleteDespesa(id: string) {
  const perm = await checkPermission("despesa", "delete");
  if (!perm.ok) throw new Error(perm.message);
  await despesaService.eliminar(id);
  await auditService.log({
    accio: "DELETE",
    userId: perm.session.user.id,
    entitat: "Despesa",
    entitatId: id,
  });
  revalidatePath("/despeses");
}

export async function getFacturaUrl(fitxerKey: string): Promise<string> {
  const perm = await checkPermission("despesa", "read");
  if (!perm.ok) throw new Error(perm.message);
  return getPresignedUrl(fitxerKey);
}
