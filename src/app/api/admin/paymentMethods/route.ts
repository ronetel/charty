import { NextResponse } from 'next/server';
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
        { methodType: { contains: search, mode: 'insensitive' } },
        { maskedData: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const allowedFields = ['id', 'methodType', 'maskedData', 'isDefault', 'createdAt', 'updatedAt'];
  let orderBy: any = { id: sortOrder || 'desc' };
  if (sortBy && allowedFields.includes(sortBy)) {
    orderBy = { [sortBy]: sortOrder || 'desc' };
  }

  const payments = await prisma.paymentMethod.findMany({
    where,
    skip: (page - 1) * page_size,
    take: page_size,
    orderBy,
  });
  const total = await prisma.paymentMethod.count({ where });
  return NextResponse.json({
    count: total,
    page,
    page_size,
    total_pages: Math.ceil(total / page_size),
    results: payments
  });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const created = await prisma.paymentMethod.create({ data: body });
    try {
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'create', entity: 'payment_method', entityId: created.id, details: { after: created } });
    } catch (e) {}
    return NextResponse.json(created);
  } catch (e) {
    console.error('POST payment method error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
