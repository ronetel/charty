import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyToken } from '../../../../lib/jwt';
import { createAuditLog } from '@/lib/audit';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, email } = body;

    const auth = request.headers.get('authorization') || request.headers.get('x-user-token');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = auth.replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token as string);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const updated = await prisma.user.update({
      where: { id: Number(payload.id) },
      data: { email: email || undefined, login: login || undefined },
    });

    try {
      await createAuditLog({ userId: Number(payload.id), action: 'update', entity: 'user_profile', entityId: Number(payload.id), details: { email, login } });
    } catch (e) {}

    const { passwordHash, ...safeUser } = updated as any;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (e) {
    console.error('Profile update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('x-user-token');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = auth.replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token as string);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.id) },
      include: { paymentMethods: true, orders: { orderBy: { createdAt: 'desc' } }, roles: { include: { role: true } } },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { passwordHash, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch (e) {
    console.error('Profile fetch error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
