"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/get-session";
import * as amortitzacionsService from "@/services/amortitzacions-service";

export async function generarAmortitzacionsAction(formData: FormData) {
  await requireSession();
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
  await requireSession();

  try {
    await amortitzacionsService.retrocedir(exercici);
  } catch {
    redirect("/amortitzacions?msg=error");
  }
  revalidatePath("/amortitzacions");
  redirect("/amortitzacions?msg=retrocedit");
}
