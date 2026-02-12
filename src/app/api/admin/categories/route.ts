import { NextResponse } from 'next/server';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import prisma from '../../../../../lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const page_size = parseInt(searchParams.get('page_size') || '50');

  const categories = await prisma.category.findMany({
    skip: (page - 1) * page_size,
    take: page_size,
    orderBy: { id: 'desc' },
  });

  const total = await prisma.category.count();
  return NextResponse.json({ count: total, next: null, previous: null, results: categories });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const created = await prisma.category.create({ data: body });
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}