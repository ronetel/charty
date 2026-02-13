import { NextResponse } from 'next/server';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import prisma from '../../../../../../lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(cat);
}

export async function PUT(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  const before = await prisma.category.findUnique({ where: { id } });
  const updated = await prisma.category.update({ where: { id }, data: body });
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
    await createAuditLog({ userId: payload?.id, action: 'update', entity: 'category', entityId: id, details });
  } catch (e) {}
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const before = await prisma.category.findUnique({ where: { id } });
  const deleted = await prisma.category.delete({ where: { id } });
  try {
    const payload = verifyToken(token || '');
    await createAuditLog({ userId: payload?.id, action: 'delete', entity: 'category', entityId: id, details: { before } });
  } catch (e) {}
  return NextResponse.json({ deleted });
}