import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = body.email || body.login;
    const newPassword = body.newPassword;

    if (!identifier || !newPassword) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: body.email ? { email: body.email } : { login: body.login },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

    try {
      await createAuditLog({ userId: user.id, action: 'change_password', entity: 'user', entityId: user.id, details: { via: 'forgot' } });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Forgot password error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
