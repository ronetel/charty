import { NextResponse } from 'next/server';
import { getTokenFromHeader, isAdminFromToken } from '@/lib/admin';
import prisma from '../../../../../lib/prisma';
import { paginationSchema, categoryCreateSchema } from '../../../../lib/validations';
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
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // Поддержка сортировки
  const allowedFields = ['id', 'name', 'description', 'createdAt', 'updatedAt'];
  let orderBy: any = { id: sortOrder || 'desc' };
  if (sortBy && allowedFields.includes(sortBy)) {
    orderBy = { [sortBy]: sortOrder || 'desc' };
  }

  const categories = await prisma.category.findMany({
    where,
    skip: (page - 1) * page_size,
    take: page_size,
    orderBy,
  });

  const total = await prisma.category.count({ where });
  return NextResponse.json({ 
    count: total, 
    page, 
    page_size, 
    total_pages: Math.ceil(total / page_size), 
    results: categories 
  });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    const validationResult = categoryCreateSchema.safeParse({
      name: body.name,
      description: body.description,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const created = await prisma.category.create({ data: validationResult.data });
    try {
      const payload = verifyToken(token || '');
      const details = { after: created };
      await createAuditLog({ userId: payload?.id, action: 'create', entity: 'category', entityId: created.id, details });
    } catch (e) {}
    return NextResponse.json(created);
  } catch (e) {
    console.error('POST category error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}