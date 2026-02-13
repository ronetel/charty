import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { verifyToken } from '../../../../lib/jwt';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('x-user-token');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = auth.replace(/^Bearer\s+/i, '');
    const payload = verifyToken(token as string);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: Number(payload.id) } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: Number(payload.id) }, data: { passwordHash: hash } });

    try {
      await createAuditLog({ userId: Number(payload.id), action: 'change_password', entity: 'user', entityId: Number(payload.id) });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Change password error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
