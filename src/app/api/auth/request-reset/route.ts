import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { sendVerificationEmail } from '@/components/email/send-email';
import { createAuditLog } from '@/lib/audit';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.email || body.login;
    if (!identifier) return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });

    const user = await prisma.user.findFirst({ where: body.email ? { email: body.email } : { login: body.login } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); 

    await prisma.resetCode.create({ data: { userId: user.id, code, expiresAt } });

    try {
      await createAuditLog({ userId: user.id, action: 'create', entity: 'reset_code', entityId: user.id, details: { expiresAt } });
    } catch (e) {}

    const html = `<p>Код для сброса пароля: <strong>${code}</strong></p><p>Он действителен 1 час.</p>`;
    try {
      await sendVerificationEmail(user.email, 'Код для сброса пароля', html);
    } catch (e) {
      console.error('Failed to send reset email', e);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Request reset error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
