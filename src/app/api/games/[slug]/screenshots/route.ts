import { NextResponse } from 'next/server';
import productsService from '@/lib/productsService';

export async function GET(req: Request, { params }: any) {
  try {
    const slug = params.slug;
    const product = await productsService.getProductBySlug(slug);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const screenshots = product.short_screenshots || [];
    return NextResponse.json({ count: screenshots.length, next: null, previous: null, results: screenshots });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
