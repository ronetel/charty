import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.order.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const deleted = await prisma.order.delete({ where: { id } });
  return NextResponse.json({ id: deleted.id });
}