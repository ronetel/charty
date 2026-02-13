import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Проверяем TOKEN
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const backupData = JSON.parse(text);

    // === 1. Очищаем таблицы (в правильном порядке) ===
    console.log("🧹 Clearing database...");
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.userPreferences.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // === 2. Восстанавливаем данные ===
    console.log("🔄 Restoring roles...");
    if (backupData.database.roles?.length > 0) {
      await prisma.role.createMany({
        data: backupData.database.roles.map((r: any) => ({
          id: r.id,
          name: r.name,
        })),
        skipDuplicates: true,
      });
    }

    console.log("🔄 Restoring categories...");
    if (backupData.database.categories?.length > 0) {
      await prisma.category.createMany({
        data: backupData.database.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
        skipDuplicates: true,
      });
    }

    console.log("🔄 Restoring users...");
    if (backupData.database.users?.length > 0) {
      await prisma.user.createMany({
        data: backupData.database.users.map((u: any) => ({
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          login: u.login,
          isActive: u.isActive,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("🔄 Restoring products...");
    if (backupData.database.products?.length > 0) {
      await prisma.product.createMany({
        data: backupData.database.products.map((p: any) => ({
          id: p.id,
          rawgId: p.rawgId,
          rawgSlug: p.rawgSlug,
          name: p.name,
          description: p.description,
          backgroundImage: p.backgroundImage,
          releasedDate: p.releasedDate ? new Date(p.releasedDate) : null,
          price: p.price,
          isActive: p.isActive,
          rating: p.rating,
          added: p.added,
          website: p.website,
          metacritic: p.metacritic,
          metadata: p.metadata,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        })),
        skipDuplicates: true,
      });
    }

    // === 3. Восстанавливаем связи M:M и дочерние сущности ===
    console.log("🔄 Restoring userRoles...");
    for (const ur of backupData.database.userRoles || []) {
      await prisma.userRole.create({
        data: {
          userId: ur.userId,
          roleId: ur.roleId,
        },
      });
    }

    console.log("🔄 Restoring productCategories...");
    for (const pc of backupData.database.productCategories || []) {
      await prisma.productCategory.create({
        data: {
          productId: pc.productId,
          categoryId: pc.categoryId,
        },
      });
    }

    console.log("🔄 Restoring orders...");
    for (const order of backupData.database.orders || []) {
      await prisma.order.create({
        data: {
          id: order.id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
        },
      });
    }

    console.log("🔄 Restoring orderItems...");
    for (const item of backupData.database.orderItems || []) {
      await prisma.orderItem.create({
        data: {
          id: item.id,
          userId: item.userId,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtOrder: item.priceAtOrder,
        },
      });
    }

    console.log("🔄 Restoring paymentMethods...");
    for (const pm of backupData.database.paymentMethods || []) {
      await prisma.paymentMethod.create({
        data: {
          id: pm.id,
          userId: pm.userId,
          methodType: pm.methodType,
          maskedData: pm.maskedData,
          isDefault: pm.isDefault,
        },
      });
    }

    console.log("🔄 Restoring userPreferences...");
    for (const pref of backupData.database.userPreferences || []) {
      await prisma.userPreferences.create({
        data: {
          userId: pref.userId,
          theme: pref.theme || "light",
          dateFormat: pref.dateFormat || "DD/MM/YYYY",
          pageSize: pref.pageSize || 10,
          savedFilters: pref.savedFilters || {},
        },
      });
    }

    console.log("✅ Restore completed!");
    try {
      const authHeader = request.headers.get("authorization") || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'restore', entity: 'backup_restore', details: { counts: backupData.meta?.counts || {}, message: 'restore performed' } });
    } catch (e) {}
    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      counts: backupData.meta?.counts || {},
    });

  } catch (error) {
    console.error("❌ Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore database" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}