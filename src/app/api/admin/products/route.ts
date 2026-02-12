import { NextResponse } from "next/server";
import { getTokenFromHeader, isAdminFromToken } from "@/lib/admin";
import productsService from "@/lib/productsService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const page_size = parseInt(searchParams.get("page_size") || "10");

  const res = await productsService.listProducts({ page, page_size, search });
  return NextResponse.json(res);
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const parsedData = {
      ...body,
      price: body.price ? parseFloat(body.price) : undefined,
      stockQuantity: body.stockQuantity
        ? parseInt(body.stockQuantity, 10)
        : undefined,
      categoryId: body.categoryId ? parseInt(body.categoryId, 10) : undefined,
    };

    if (!parsedData.name || typeof parsedData.name !== "string") {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    if (parsedData.price && isNaN(parsedData.price)) {
      return NextResponse.json(
        { error: "Invalid price value" },
        { status: 400 },
      );
    }

    if (parsedData.stockQuantity && isNaN(parsedData.stockQuantity)) {
      return NextResponse.json(
        { error: "Invalid stock quantity value" },
        { status: 400 },
      );
    }

    const created = await productsService.createProduct(parsedData);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST create product error:", e);

    if (e instanceof Error) {
      if (e.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "Product with this identifier already exists" },
          { status: 409 },
        );
      }
      if (e.message.includes("Invalid value")) {
        return NextResponse.json(
          { error: "Invalid data types provided" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
