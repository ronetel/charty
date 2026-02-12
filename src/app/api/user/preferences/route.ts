import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(req.headers.get('x-user-id') || '0');
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    return NextResponse.json(preferences || { theme: 'dark' });
  } catch (e) {
    console.error('Preferences fetch error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = parseInt(req.headers.get('x-user-id') || '0');
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
    }

    const body = await req.json();
    const { theme } = body;

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    const updated = await prisma.userPreferences.upsert({
      where: { userId },
      update: { theme },
      create: { userId, theme, dateFormat: 'dd.MM.yyyy', pageSize: 10 }
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Preferences update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
