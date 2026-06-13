import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { can, type Resource, type Action } from "./permissions";
import type { Role } from "@prisma/client";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function checkPermission(resource: Resource, action: Action) {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, message: "Has d'estar autenticat" };
  }
  if (!can(session.user.role as Role, resource, action)) {
    return { ok: false as const, message: "No tens permís per fer aquesta acció" };
  }
  return { ok: true as const, session };
}

// Per amagar botons al UI segons el rol (el servidor ja valida amb checkPermission).
export async function currentUserCan(resource: Resource, action: Action) {
  const session = await getSession();
  if (!session) return false;
  return can(session.user.role as Role, resource, action);
}
