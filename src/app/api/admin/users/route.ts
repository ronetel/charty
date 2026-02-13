import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import { paginationSchema } from '../../../../lib/validations';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  const paginationData = paginationSchema.safeParse({
    page: parseInt(searchParams.get('page') || '1'),
    page_size: parseInt(searchParams.get('page_size') || '10'),
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || undefined,
  });

  if (!paginationData.success) {
    return NextResponse.json(
      { error: 'Validation error', errors: paginationData.error.issues },
      { status: 400 }
    );
  }

  const { page, page_size, search, sortBy, sortOrder } = paginationData.data;

  let where: any = {};
  if (search) {
    where = {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { login: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // Поддержка сортировки
  const allowedFields = ['id', 'email', 'login', 'isActive', 'createdAt', 'updatedAt'];
  let orderBy: any = { id: sortOrder || 'desc' };
  if (sortBy && allowedFields.includes(sortBy)) {
    orderBy = { [sortBy]: sortOrder || 'desc' };
  }

  const users = await prisma.user.findMany({
    where,
    include: { roles: { include: { role: true } } },
    skip: (page - 1) * page_size,
    take: page_size,
    orderBy,
  });
  const total = await prisma.user.count({ where });
  const safe = users.map((u: any) => ({ ...u, passwordHash: undefined }));
  return NextResponse.json({ 
    count: total, 
    page, 
    page_size, 
    total_pages: Math.ceil(total / page_size), 
    results: safe 
  });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.email || !body.password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const passwordHash = await bcrypt.hash(body.password, 10);
  try {
    const created = await prisma.user.create({ 
      data: { 
        email: body.email, 
        passwordHash, 
        login: body.login || body.email 
      } 
    });
    try {
      const after = { id: created.id, email: created.email, login: created.login, isActive: created.isActive };
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id || created.id, action: 'create', entity: 'user', entityId: created.id, details: { after } });
    } catch (e) {}
    return NextResponse.json({ id: created.id, email: created.email, login: created.login });
  } catch (e) {
    console.error('POST user error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
