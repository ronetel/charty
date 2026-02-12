import { NextResponse } from 'next/server';
import { isAdminFromToken, getTokenFromHeader } from '@/lib/admin';
import productsService from '@/lib/productsService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const page_size = parseInt(searchParams.get('page_size') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const categoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined;

  const res = await productsService.listProducts({ page, page_size, search, sortBy, sortOrder, categoryId });
  return NextResponse.json(res);
}

export async function POST(req: Request) {

  try {
    const token = getTokenFromHeader(req);
    if (!isAdminFromToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const created = await productsService.createProduct(body);
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
