import { NextResponse } from 'next/server';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import prisma from '../../../../../../lib/prisma';

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
  const updated = await prisma.category.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const deleted = await prisma.category.delete({ where: { id } });
  return NextResponse.json({ deleted });
}