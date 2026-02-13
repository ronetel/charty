import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');

    const where: any = {};

    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { id: true, email: true, login: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.auditLog.count();

    return NextResponse.json({ results: logs, count: total, page, pageSize });
  } catch (e) {
    console.error('Fetch audit logs error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
