"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/get-session";
import * as usersService from "@/services/users-service";
import * as auditService from "@/services/audit-service";

export type FormState = { message?: string };

export async function canviarContrasenya(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const actual = formData.get("actual")?.toString() ?? "";
  const nova = formData.get("nova")?.toString() ?? "";
  const confirmar = formData.get("confirmar")?.toString() ?? "";

  if (nova.length < 8) {
    return { message: "La nova contrasenya ha de tenir almenys 8 caràcters" };
  }
  if (nova !== confirmar) {
    return { message: "Les contrasenyes noves no coincideixen" };
  }

  const h = await headers();
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: actual,
        newPassword: nova,
        revokeOtherSessions: true,
      },
      headers: h,
    });
  } catch (err) {
    if (err instanceof APIError) {
      return { message: "La contrasenya actual no és correcta" };
    }
    return { message: "No s'ha pogut canviar la contrasenya" };
  }

  await usersService.actualitzar(session.user.id, {
    mustChangePassword: false,
    passwordChangedAt: new Date(),
  });

  await auditService.log({
    accio: "PASSWORD_CHANGE",
    userId: session.user.id,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  redirect("/dashboard");
}
