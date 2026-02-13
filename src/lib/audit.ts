import prisma from '../../lib/prisma';

export type AuditPayload = {
  userId?: number | null;
  action: string;
  entity: string;
  entityId?: string | number | null;
  details?: any;
  ip?: string | null;
};

export async function createAuditLog(payload: AuditPayload) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: payload.userId ? Number(payload.userId) : undefined,
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId ? String(payload.entityId) : undefined,
        details: payload.details ? payload.details : undefined,
        ip: payload.ip || undefined,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log', e);
  }
}
