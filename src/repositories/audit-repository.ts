import { prisma } from "./prisma-client";
import type { AccioAudit, Prisma } from "@prisma/client";

export async function create(data: Prisma.AuditLogUncheckedCreateInput) {
  return prisma.auditLog.create({ data });
}

export async function findAll(filters?: {
  accio?: AccioAudit;
  userId?: string;
  desDe?: Date;
  finsA?: Date;
}) {
  const { accio, userId, desDe, finsA } = filters ?? {};
  return prisma.auditLog.findMany({
    where: {
      ...(accio ? { accio } : {}),
      ...(userId ? { userId } : {}),
      ...(desDe || finsA
        ? {
            timestamp: {
              ...(desDe ? { gte: desDe } : {}),
              ...(finsA ? { lte: finsA } : {}),
            },
          }
        : {}),
    },
    include: { user: true },
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}
