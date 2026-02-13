import { NextResponse } from "next/server";
import { getTokenFromHeader, isAdminFromToken } from "@/lib/admin";
import productsService from "@/lib/productsService";
import { productUpdateSchema } from "@/lib/validations";
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const slug = params.id;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Invalid product identifier" },
        { status: 400 },
      );
    }

    const product = await productsService.getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (e) {
    console.error("GET product error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Валидация данных продукта
    const validationResult = productUpdateSchema.safeParse({
      id,
      name: body.name,
      description: body.description,
      price: body.price ? parseFloat(body.price) : undefined,
      releasedDate: body.releasedDate,
      rating: body.rating ? parseFloat(body.rating) : undefined,
      website: body.website,
      background_image: body.background_image,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        { error: "Validation error", errors },
        { status: 400 }
      );
    }

    const before = await productsService.getProductBySlug(String(id));
    const updated = await productsService.updateProduct(id, validationResult.data);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      const payload = verifyToken(token || '');
      const details: any = { before, after: updated };
      // compute simple diff
      const diff: Record<string, any> = {};
      const keys = new Set([...Object.keys(before || {}), ...Object.keys(updated || {})]);
      keys.forEach((k: any) => {
        const bv = (before as any)?.[k];
        const av = (updated as any)?.[k];
        if (JSON.stringify(bv) !== JSON.stringify(av)) diff[k] = { from: bv, to: av };
      });
      details.diff = diff;
      await createAuditLog({ userId: payload?.id, action: 'update', entity: 'product', entityId: updated.id, details });
    } catch (e) {}

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PUT product error:", e);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number(params.id);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const before = await productsService.getProductBySlug(String(id));
    const deleted = await productsService.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      const payload = verifyToken(token || '');
      const details = { before };
      await createAuditLog({ userId: payload?.id, action: 'delete', entity: 'product', entityId: deleted.id, details });
    } catch (e) {}

    return NextResponse.json({ success: true, deleted });
  } catch (e) {
    console.error("DELETE product error:", e);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
