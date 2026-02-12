import { NextResponse } from 'next/server';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';
import productsService from '@/lib/productsService';

export async function GET(req: Request, { params }: any) {
  try {
    const slug = params.slug;
    const result = await productsService.getProductBySlug(slug);
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = params.slug;
    const body = await req.json();

    let id = Number(slug);
    if (isNaN(id)) {
      const product = await productsService.getProductBySlug(slug);
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      id = product.id;
    }

    const updated = await productsService.updateProduct(Number(id), body);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slug = params.slug;
    let id = Number(slug);
    if (isNaN(id)) {
      const product = await productsService.getProductBySlug(slug);
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      id = product.id;
    }

    const deleted = await productsService.deleteProduct(Number(id));
    return NextResponse.json({ deleted });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
