"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import * as auditService from "@/services/audit-service";

export async function logoutAction() {
  const session = await getSession();
  const h = await headers();
  await auth.api.signOut({ headers: h });
  if (session) {
    await auditService.log({
      accio: "LOGOUT",
      userId: session.user.id,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });
  }
  redirect("/login");
}
