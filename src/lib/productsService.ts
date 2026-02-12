import { JsonObject } from "@prisma/client/runtime/client";
import prisma from "../../lib/prisma";

function mapProductToClient(p: any) {
  const metadata = p.metadata || {};

  return {
    id: p.id,
    name: p.name,
    background_image: p.backgroundImage || null,
    price: p.price ? String(p.price) : "0",
    slug: p.rawgSlug || String(p.id),
    description_raw: p.description || "",
    website: p.website || metadata.website || "",
    metacritic: p.metacritic || metadata.metacritic || null,
    short_screenshots: p.backgroundImage
      ? [{ id: p.id, image: p.backgroundImage }]
      : metadata.short_screenshots || [],
    genres: (p.categories || []).map((pc: any) => ({
      name: pc.category?.name || "",
    })),
    platforms: (metadata.platforms || []).map((plat: any) => ({
      platform: {
        name: plat.platform?.name || plat.name || "",
        slug: plat.platform?.slug || plat.slug || "",
      },
    })),
    developers: (metadata.developers || []).map((dev: any) => ({
      name: dev.name || "",
    })),
    publishers: (metadata.publishers || []).map((pub: any) => ({
      name: pub.name || "",
    })),
    ratings: (metadata.ratings || []).map((rating: any) => ({
      id: rating.id || 0,
      count: rating.count || 0,
      percent: rating.percent || 0,
      title: rating.title || "",
    })),
    rating: p.rating || metadata.rating || 0,
    added: p.added || metadata.added || 0,
    released: p.releasedDate
      ? new Date(p.releasedDate).toISOString().split("T")[0]
      : null,
    stores: (metadata.stores || []).map((store: any) => ({
      store: {
        domain: store.store?.domain || store.domain || "",
        name: store.store?.name || store.name || "",
        slug: store.store?.slug || store.slug || "",
      },
    })),
  };
}

export async function listProducts({
  page = 1,
  page_size = 10,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
  categoryId,
}: {
  page?: number;
  page_size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryId?: number;
}) {
  const where: any = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) {
    where.categories = {
      some: { categoryId },
    };
  }

  const total = await prisma.product.count({ where });

  // ✅ Валидные варианты сортировки (без полей из metadata)
  const orderByMap: any = {
    createdAt: { createdAt: sortOrder },
    price: { price: sortOrder },
    name: { name: sortOrder },
    // ⚠️ added и rating недоступны для сортировки - они в metadata
  };

  // Если запрашивается недоступная сортировка, используем дефолтную
  const orderBy = orderByMap[sortBy] || { createdAt: sortOrder };

  const products = await prisma.product.findMany({
    where,
    include: { categories: { include: { category: true } } },
    skip: (page - 1) * page_size,
    take: page_size,
    orderBy,
  });

  return {
    count: total,
    next: null,
    previous: null,
    results: products.map(mapProductToClient),
  };
}

export async function getProductBySlug(slug: string) {
  const byId = Number(slug);
  const product = await prisma.product.findFirst({
    where: { OR: [{ rawgSlug: slug }, ...(isNaN(byId) ? [] : [{ id: byId }])] },
    include: { categories: { include: { category: true } } },
  });
  if (!product) return null;
  return mapProductToClient(product);
}

export async function createProduct(data: any) {
  const {
    id,
    short_screenshots,
    genres,
    platforms,
    developers,
    publishers,
    ratings,
    stores,
    background_image,
    description_raw,
    released,
    slug,
    website,
    metacritic,
    rating,
    added,
    ...rest
  } = data;

  // Разделяем данные на поля схемы и метаданные
  const schemaFields: any = {
    ...rest,
    backgroundImage: background_image || data.backgroundImage,
    description: description_raw || data.description,
    rawgSlug: slug || data.rawgSlug,
    price: data.price ? parseFloat(data.price) : undefined,
    stockQuantity: data.stockQuantity
      ? parseInt(data.stockQuantity, 10)
      : undefined,
    categoryId: data.categoryId ? parseInt(data.categoryId, 10) : undefined,
    rawgId: data.rawgId ? parseInt(data.rawgId, 10) : undefined,
    releasedDate: released ? new Date(released) : undefined,
  };

  // Метаданные для несуществующих полей
  const metadata: any = {
    website: website || data.website,
    metacritic: metacritic || data.metacritic,
    rating: rating || data.rating,
    added: added || data.added,
    short_screenshots: short_screenshots || data.short_screenshots,
    platforms: platforms || data.platforms,
    developers: developers || data.developers,
    publishers: publishers || data.publishers,
    ratings: ratings || data.ratings,
    stores: stores || data.stores,
  };

  // Удаляем неопределенные значения
  Object.keys(schemaFields).forEach((key) => {
    if (schemaFields[key] === undefined) delete schemaFields[key];
  });

  Object.keys(metadata).forEach((key) => {
    if (metadata[key] === undefined) delete metadata[key];
  });

  const created = await prisma.product.create({
    data: {
      ...schemaFields,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    },
  });

  return mapProductToClient(created);
}

export const updateProduct = async (id: number, data: any) => {
  const {
    id: _,
    short_screenshots,
    genres,
    platforms,
    developers,
    publishers,
    ratings,
    stores,
    background_image,
    description_raw,
    released,
    slug,
    website,
    metacritic,
    rating,
    added,
    ...rest
  } = data;

  // Поля схемы
  const schemaFields: any = {
    ...rest,
    backgroundImage: background_image || data.backgroundImage,
    description: description_raw || data.description,
    rawgSlug: slug || data.rawgSlug,
    price: data.price !== undefined ? parseFloat(data.price) : undefined,
    stockQuantity:
      data.stockQuantity !== undefined
        ? parseInt(data.stockQuantity, 10)
        : undefined,
    categoryId:
      data.categoryId !== undefined ? parseInt(data.categoryId, 10) : undefined,
    rawgId: data.rawgId !== undefined ? parseInt(data.rawgId, 10) : undefined,
    releasedDate: released ? new Date(released) : undefined,
    isActive: data.isActive !== undefined ? data.isActive : undefined,
  };

  // Метаданные
  const metadata: any = {
    website: website !== undefined ? website : data.website,
    metacritic: metacritic !== undefined ? metacritic : data.metacritic,
    rating: rating !== undefined ? rating : data.rating,
    added: added !== undefined ? added : data.added,
    short_screenshots:
      short_screenshots !== undefined
        ? short_screenshots
        : data.short_screenshots,
    platforms: platforms !== undefined ? platforms : data.platforms,
    developers: developers !== undefined ? developers : data.developers,
    publishers: publishers !== undefined ? publishers : data.publishers,
    ratings: ratings !== undefined ? ratings : data.ratings,
    stores: stores !== undefined ? stores : data.stores,
  };

  // Удаляем неопределенные значения из схемы
  Object.keys(schemaFields).forEach((key) => {
    if (schemaFields[key] === undefined) delete schemaFields[key];
  });

  // Получаем текущий продукт для объединения метаданных
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: { metadata: true },
  });

  const currentMetadata = currentProduct?.metadata || {};

  // Объединяем метаданные (перезаписываем только переданные поля)
  const mergedMetadata = { ...(currentMetadata as JsonObject) };

  Object.keys(metadata).forEach((key) => {
    if (metadata[key] !== undefined) {
      mergedMetadata[key] = metadata[key];
    } else {
      delete mergedMetadata[key];
    }
  });

  // Если метаданные пустые, не обновляем их
  const updateData: any = {
    ...schemaFields,
  };

  if (Object.keys(mergedMetadata).length > 0) {
    updateData.metadata = mergedMetadata;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { categories: { include: { category: true } } },
  });

  return mapProductToClient(updated);
};

export async function deleteProduct(id: number) {
  const deleted = await prisma.product.delete({ where: { id } });
  return mapProductToClient(deleted);
}

export default {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
