import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json({ results: categories });
  } catch (e) {
    console.error('Categories fetch error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const created = await prisma.category.create({
      data: { name, description }
    });
    try {
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'create', entity: 'category', entityId: created.id, details: { after: created } });
    } catch (e) {}
    return NextResponse.json(created);
  } catch (e) {
    console.error('Category create error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
