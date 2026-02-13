import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, newPassword } = body;
    if (!code || !newPassword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const reset = await prisma.resetCode.findFirst({ where: { code } });
    if (!reset) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    if (new Date(reset.expiresAt) < new Date()) return NextResponse.json({ error: 'Code expired' }, { status: 400 });

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: hash } });
    // remove used code record
    await prisma.resetCode.delete({ where: { id: reset.id } });

    try {
      await createAuditLog({ userId: reset.userId, action: 'change_password', entity: 'user', entityId: reset.userId, details: { via: 'reset_code' } });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Confirm reset error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
