import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(role);
}

export async function PUT(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id = Number(params.id);
    const body = await req.json();
    const before = await prisma.role.findUnique({ where: { id } });
    const updated = await prisma.role.update({ where: { id }, data: body });
    try {
      const payload = verifyToken(token || '');
      const details: any = { before, after: updated };
      const diff: Record<string, any> = {};
      const keys = new Set([...Object.keys(before || {}), ...Object.keys(updated || {})]);
      keys.forEach((k: any) => {
        const bv = (before as any)?.[k];
        const av = (updated as any)?.[k];
        if (JSON.stringify(bv) !== JSON.stringify(av)) diff[k] = { from: bv, to: av };
      });
      details.diff = diff;
      await createAuditLog({ userId: payload?.id, action: 'update', entity: 'role', entityId: updated.id, details });
    } catch (e) {}
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const before = await prisma.role.findUnique({ where: { id } });
  const deleted = await prisma.role.delete({ where: { id } });
  try {
    const payload = verifyToken(token || '');
    await createAuditLog({ userId: payload?.id, action: 'delete', entity: 'role', entityId: id, details: { before } });
  } catch (e) {}
  return NextResponse.json({ id: deleted.id });
}