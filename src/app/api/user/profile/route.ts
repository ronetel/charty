import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, login, email } = body;
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        email: email || undefined,
        login: login || undefined,
      },
    });

    const { passwordHash, ...safeUser } = updated as any;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (e) {
    console.error('Profile update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
