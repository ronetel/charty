import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';

export async function GET() {
  const payments = await prisma.paymentMethod.findMany();
  return NextResponse.json({ count: payments.length, results: payments });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const created = await prisma.paymentMethod.create({ data: body });
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}