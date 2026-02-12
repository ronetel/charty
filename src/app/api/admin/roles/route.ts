import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

export async function GET() {
  const roles = await prisma.role.findMany();
  return NextResponse.json({ count: roles.length, results: roles });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const created = await prisma.role.create({ data: { name: body.name } });
  return NextResponse.json(created);
}