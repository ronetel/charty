import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);
    const categories = await prisma.productCategory.findMany({
      where: { productId },
      include: { category: true }
    });
    return NextResponse.json({ results: categories });
  } catch (e) {
    console.error('Product categories fetch error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId } = body;
    const productId = parseInt(params.id);

    if (!categoryId) {
      return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
    }

    const created = await prisma.productCategory.create({
      data: { productId, categoryId }
    });
    try {
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'create', entity: 'product_category', entityId: `${productId}_${categoryId}`, details: { productId, categoryId } });
    } catch (e) {}
    return NextResponse.json(created);
  } catch (e) {
    console.error('Product category create error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId } = body;
    const productId = parseInt(params.id);

    if (!categoryId) {
      return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
    }

    const deleted = await prisma.productCategory.delete({
      where: { productId_categoryId: { productId, categoryId } }
    });
    try {
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'delete', entity: 'product_category', entityId: `${productId}_${categoryId}`, details: { productId, categoryId } });
    } catch (e) {}
    return NextResponse.json(deleted);
  } catch (e) {
    console.error('Product category delete error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
