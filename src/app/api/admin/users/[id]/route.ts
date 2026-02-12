import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

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

  const updated = await prisma.user.update({ where: { id }, data });
  const safe = { ...updated, passwordHash: undefined };
  return NextResponse.json(safe);
}

export async function DELETE(req: Request, { params }: any) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  const deleted = await prisma.user.delete({ where: { id } });
  return NextResponse.json({ id: deleted.id });
}