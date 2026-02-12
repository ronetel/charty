import { NextResponse } from "next/server";
import { getTokenFromHeader, isAdminFromToken } from "@/lib/admin";
import productsService from "@/lib/productsService";

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

    const updated = await productsService.updateProduct(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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

    const deleted = await productsService.deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted });
  } catch (e) {
    console.error("DELETE product error:", e);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
