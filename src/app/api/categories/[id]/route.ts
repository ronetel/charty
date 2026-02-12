import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;
    const categoryId = parseInt(params.id);

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name, description }
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Category update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);

    const deleted = await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json(deleted);
  } catch (e) {
    console.error('Category delete error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
