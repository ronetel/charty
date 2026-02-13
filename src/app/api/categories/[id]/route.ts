import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;
    const categoryId = parseInt(params.id);

    const before = await prisma.category.findUnique({ where: { id: categoryId } });
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name, description }
    });
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
      await createAuditLog({ userId: payload?.id, action: 'update', entity: 'category', entityId: categoryId, details });
    } catch (e) {}
    return NextResponse.json(updated);
  } catch (e) {
    console.error('Category update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);

    const before = await prisma.category.findUnique({ where: { id: categoryId } });
    const deleted = await prisma.category.delete({
      where: { id: categoryId }
    });
    try {
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'delete', entity: 'category', entityId: categoryId, details: { before } });
    } catch (e) {}
    return NextResponse.json(deleted);
  } catch (e) {
    console.error('Category delete error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
