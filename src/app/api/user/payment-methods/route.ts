import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, methodType, maskedData, isDefault } = body;
    if (!userId || !methodType || !maskedData) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (isDefault) {
      await prisma.paymentMethod.updateMany({ where: { userId: Number(userId) }, data: { isDefault: false } });
    }

    const created = await prisma.paymentMethod.create({
      data: {
        userId: Number(userId),
        methodType,
        maskedData,
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ success: true, method: created });
  } catch (e) {
    console.error('Create payment method error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, userId, maskedData, isDefault } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    if (isDefault && userId) {
      await prisma.paymentMethod.updateMany({ where: { userId: Number(userId) }, data: { isDefault: false } });
    }

    const updated = await prisma.paymentMethod.update({ where: { id: Number(id) }, data: { maskedData: maskedData || undefined, isDefault: isDefault === undefined ? undefined : !!isDefault } });
    return NextResponse.json({ success: true, method: updated });
  } catch (e) {
    console.error('Update payment method error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.paymentMethod.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete payment method error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
