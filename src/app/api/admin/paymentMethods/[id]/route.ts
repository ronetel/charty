import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);
  const pm = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!pm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(pm);
}

export async function PUT(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const id = Number(params.id);
    const body = await req.json();
    const updated = await prisma.paymentMethod.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const deleted = await prisma.paymentMethod.delete({ where: { id } });
  return NextResponse.json({ id: deleted.id });
}