import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getTokenFromHeader } from '@/lib/admin';
import { verifyToken } from '@/lib/jwt';
import { createAuditLog } from '@/lib/audit';

async function findOrCreateCart(userId: number) {
  let cart = await prisma.order.findFirst({
    where: { userId, status: 'cart' },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.order.create({
      data: { userId, totalAmount: 0, status: 'cart' },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req as any as Request);
    const payload = verifyToken(token || '');
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cart = await findOrCreateCart(Number(payload.id));
    return NextResponse.json({ cart });
  } catch (e) {
    console.error('Cart GET error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req as any as Request);
    const payload = verifyToken(token || '');
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productId, quantity = 1 } = body;
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    const userId = Number(payload.id);
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const cart = await findOrCreateCart(userId);

    const existing = await prisma.orderItem.findFirst({ where: { orderId: cart.id, productId: Number(productId) } });
    if (existing) {
      const updated = await prisma.orderItem.update({ where: { id: existing.id }, data: { quantity: { increment: Number(quantity) } } });
    } else {
      await prisma.orderItem.create({ data: { orderId: cart.id, userId, productId: Number(productId), quantity: Number(quantity), priceAtOrder: Number(product.price) } });
    }

    const items = await prisma.orderItem.findMany({ where: { orderId: cart.id }, include: { product: true } });
    const total = items.reduce((s, it) => s + Number(it.priceAtOrder) * it.quantity, 0);
    await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: total } });

    try {
      await createAuditLog({ userId, action: 'cart_add', entity: 'order_item', entityId: String(productId), details: { productId, quantity } });
    } catch (e) {}

    const newCart = await prisma.order.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
    return NextResponse.json({ cart: newCart });
  } catch (e) {
    console.error('Cart POST error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req as any as Request);
    const payload = verifyToken(token || '');
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

    const userId = Number(payload.id);
    const cart = await prisma.order.findFirst({ where: { userId, status: 'cart' } });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const deleted = await prisma.orderItem.deleteMany({ where: { orderId: cart.id, productId: Number(productId) } });

    const items = await prisma.orderItem.findMany({ where: { orderId: cart.id }, include: { product: true } });
    const total = items.reduce((s, it) => s + Number(it.priceAtOrder) * it.quantity, 0);
    await prisma.order.update({ where: { id: cart.id }, data: { totalAmount: total } });

    try {
      await createAuditLog({ userId, action: 'cart_remove', entity: 'order_item', entityId: productId, details: { productId } });
    } catch (e) {}

    const newCart = await prisma.order.findUnique({ where: { id: cart.id }, include: { items: { include: { product: true } } } });
    return NextResponse.json({ cart: newCart });
  } catch (e) {
    console.error('Cart DELETE error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
