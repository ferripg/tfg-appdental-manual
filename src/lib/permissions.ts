import type { Role } from "@prisma/client";

export type Resource =
  | "proveidor"
  | "tipusDespesa"
  | "despesa"
  | "inventari"
  | "amortitzacio"
  | "user";
export type Action = "create" | "update" | "delete" | "read";

const POLICY: Record<Role, Partial<Record<Resource, Action[]>>> = {
  ADMIN: {}, // ADMIN: tot
  MANAGER: {
    proveidor: ["create", "update", "delete", "read"],
    tipusDespesa: ["create", "update", "delete", "read"],
    despesa: ["create", "update", "delete", "read"],
    inventari: ["create", "update", "delete", "read"],
    amortitzacio: ["create", "update", "delete", "read"],
  },
  OPERARI: {
    despesa: ["create", "read"],
    proveidor: ["read"],
    tipusDespesa: ["read"],
    inventari: ["read"],
    amortitzacio: ["read"],
  },
};

export function can(role: Role, resource: Resource, action: Action): boolean {
  if (role === "ADMIN") return true;
  return POLICY[role]?.[resource]?.includes(action) ?? false;
}
