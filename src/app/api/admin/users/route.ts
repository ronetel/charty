import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

export async function GET(req: Request) {
  const users = await prisma.user.findMany({ include: { roles: { include: { role: true } } } });
  const safe = users.map((u: any) => ({ ...u, passwordHash: undefined }));
  return NextResponse.json({ count: safe.length, results: safe });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.email || !body.password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const passwordHash = await bcrypt.hash(body.password, 10);
  try {
    const created = await prisma.user.create({ data: { email: body.email, passwordHash, login: body.login || body.email } });
    return NextResponse.json({ id: created.id, email: created.email, login: created.login });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}