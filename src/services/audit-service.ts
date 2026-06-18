import * as auditRepository from "@/repositories/audit-repository";
import type { AccioAudit, Prisma } from "@prisma/client";

type LogParams = {
  accio: AccioAudit;
  userId?: string | null;
  entitat?: string;
  entitatId?: string;
  canvis?: Prisma.InputJsonValue;
  ip?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function log(params: LogParams) {
  try {
    await auditRepository.create({
      accio: params.accio,
      userId: params.userId ?? null,
      entitat: params.entitat,
      entitatId: params.entitatId,
      canvis: params.canvis,
      ip: params.ip,
      metadata: params.metadata,
    });
  } catch (err) {
    console.error("[audit-service] No s'ha pogut registrar l'auditoria:", err);
  }
}

export async function llistar(filters?: {
  accio?: AccioAudit;
  userId?: string;
  desDe?: Date;
  finsA?: Date;
}) {
  return auditRepository.findAll(filters);
}
