import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);
  const u = await prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const safe = { ...u, passwordHash: undefined };
  return NextResponse.json(safe);
}

export async function PUT(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  if (body.password) body.passwordHash = await bcrypt.hash(body.password, 10);
  const data = { ...body };
  delete data.password;

  const before = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, login: true, isActive: true } });
  const updated = await prisma.user.update({ where: { id }, data });
  try {
    const payload = verifyToken(token || '');
    const after = { id: updated.id, email: updated.email, login: updated.login, isActive: updated.isActive };
    const details: any = { before, after };
    const diff: Record<string, any> = {};
    const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    keys.forEach((k: any) => {
      const bv = (before as any)?.[k];
      const av = (after as any)?.[k];
      if (JSON.stringify(bv) !== JSON.stringify(av)) diff[k] = { from: bv, to: av };
    });
    details.diff = diff;
    await createAuditLog({ userId: payload?.id || Number(id), action: 'update', entity: 'user', entityId: id, details });
  } catch (e) {}
  const safe = { ...updated, passwordHash: undefined };
  return NextResponse.json(safe);
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const before = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, login: true, isActive: true } });
  const deleted = await prisma.user.delete({ where: { id } });
  try {
    const payload = verifyToken(token || '');
    await createAuditLog({ userId: payload?.id || Number(id), action: 'delete', entity: 'user', entityId: id, details: { before } });
  } catch (e) {}
  return NextResponse.json({ id: deleted.id });
}