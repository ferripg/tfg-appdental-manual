"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPermission } from "@/lib/get-session";
import * as amortitzacionsService from "@/services/amortitzacions-service";

export async function generarAmortitzacionsAction(formData: FormData) {
  const perm = await checkPermission("amortitzacio", "create");
  if (!perm.ok) throw new Error(perm.message);

  const exercici = Number(formData.get("exercici"));
  if (!exercici || Number.isNaN(exercici)) {
    redirect("/amortitzacions?msg=error");
  }

  try {
    await amortitzacionsService.generarAmortitzacions(exercici);
  } catch {
    redirect("/amortitzacions?msg=error");
  }
  revalidatePath("/amortitzacions");
  redirect("/amortitzacions?msg=generat");
}

export async function retrocedirAction(exercici: number) {
  const perm = await checkPermission("amortitzacio", "delete");
  if (!perm.ok) throw new Error(perm.message);

  try {
    await amortitzacionsService.retrocedir(exercici);
  } catch {
    redirect("/amortitzacions?msg=error");
  }
  revalidatePath("/amortitzacions");
  redirect("/amortitzacions?msg=retrocedit");
}
