import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { signToken } from '../../../../../lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, login } = body;

    if ((!email && !login) || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

    const user = await prisma.user.findFirst({
      where: email ? { email } : { login },
      include: { roles: { include: { role: true } } },
    });

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const roles = (user.roles || []).map((r: any) => r.role?.name).filter(Boolean);

    const token = signToken({ id: user.id, email: user.email, roles });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, roles } });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
