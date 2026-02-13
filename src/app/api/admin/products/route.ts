import { NextResponse } from "next/server";
import { getTokenFromHeader, isAdminFromToken } from "@/lib/admin";
import productsService from "@/lib/productsService";
import { productCreateSchema, paginationSchema } from "@/lib/validations";
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Валидация параметров пагинации
  const paginationData = paginationSchema.safeParse({
    page: parseInt(searchParams.get("page") || "1"),
    page_size: parseInt(searchParams.get("page_size") || "10"),
    search: searchParams.get("search") || undefined,
    sortBy: searchParams.get("sortBy") || undefined,
    sortOrder: searchParams.get("sortOrder") || undefined,
  });

  if (!paginationData.success) {
    return NextResponse.json(
      { error: "Ошибка валидации параметров", errors: paginationData.error.issues },
      { status: 400 }
    );
  }

  const { page, page_size, search, sortBy, sortOrder } = paginationData.data;

  const res = await productsService.listProducts({ 
    page, 
    page_size, 
    search,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc" || "desc"
  });
  const total = typeof res.count === "number" ? res.count : 0;
  const total_pages = page_size > 0 ? Math.ceil(total / page_size) : 1;
  return NextResponse.json({
    count: total,
    page,
    page_size,
    total_pages,
    results: res.results || [],
  });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!isAdminFromToken(token))
    return NextResponse.json({ error: "Неавторизовано" }, { status: 401 });

  try {
    const body = await req.json();

    // Валидация данных продукта
    const validationResult = productCreateSchema.safeParse({
      name: body.name,
      description: body.description,
      price: body.price ? parseFloat(body.price) : undefined,
      releasedDate: body.releasedDate,
      rating: body.rating ? parseFloat(body.rating) : 0,
      website: body.website,
      background_image: body.background_image,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        { error: "Ошибка валидации", errors },
        { status: 400 }
      );
    }

    const parsedData = {
      ...validationResult.data,
      categoryId: body.categoryId ? parseInt(body.categoryId, 10) : undefined,
    };

    const created = await productsService.createProduct(parsedData);
    try {
      const payload = verifyToken(token || '');
      const details = { after: created };
      await createAuditLog({ userId: payload?.id, action: 'create', entity: 'product', entityId: created.id, details });
    } catch (e) {}
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST create product error:", e);

    if (e instanceof Error) {
      if (e.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "Продукт с таким идентификатором уже существует" },
          { status: 409 },
        );
      }
      if (e.message.includes("Invalid value")) {
        return NextResponse.json(
          { error: "Предоставлены недействительные типы данных" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Ошибка при создании продукта" },
      { status: 500 },
    );
  }
}
