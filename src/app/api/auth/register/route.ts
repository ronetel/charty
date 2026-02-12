import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { signToken } from '../../../../../lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, login } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { login }] } });
    if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        login: login || email,
      },
    });

    const token = signToken({ id: created.id, email: created.email });

    const user = { id: created.id, email: created.email };

    return NextResponse.json({ token, user });
  } catch (e) {
    console.error('Register error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
