import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const backupData = JSON.parse(text);

    // Начинаем транзакцию
    await prisma.$transaction(async (tx) => {
      // Очищаем таблицы (в правильном порядке для каскадных удалений)
      await tx.orderItem.deleteMany();
      await tx.order.deleteMany();
      await tx.paymentMethod.deleteMany();
      await tx.productCategory.deleteMany();
      await tx.userPreferences.deleteMany();
      await tx.userRole.deleteMany();
      await tx.product.deleteMany();
      await tx.category.deleteMany();
      await tx.user.deleteMany();
      await tx.role.deleteMany();

      // Восстанавливаем данные
      // Сначала роли
      for (const role of backupData.database.roles) {
        await tx.role.create({
          data: {
            id: role.id,
            name: role.name,
          },
        });
      }

      // Затем категории
      for (const category of backupData.database.categories) {
        await tx.category.create({
          data: {
            id: category.id,
            name: category.name,
            description: category.description,
          },
        });
      }

      // Пользователи
      for (const user of backupData.database.users) {
        await tx.user.create({
          data: {
            id: user.id,
            email: user.email,
            passwordHash: user.passwordHash,
            login: user.login,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      }

      // Продукты
      for (const product of backupData.database.products) {
        await tx.product.create({
          data: {
            id: product.id,
            rawgId: product.rawgId,
            rawgSlug: product.rawgSlug,
            name: product.name,
            description: product.description,
            backgroundImage: product.backgroundImage,
            releasedDate: product.releasedDate,
            price: product.price,
            digitalKey: product.digitalKey,
            stockQuantity: product.stockQuantity,
            isActive: product.isActive,
            rating: product.rating,
            added: product.added,
            website: product.website,
            metacritic: product.metacritic,
            metadata: product.metadata,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
        });
      }

      // Связи многие-ко-многим
      for (const userRole of backupData.database.userRoles) {
        await tx.userRole.create({
          data: {
            userId: userRole.userId,
            roleId: userRole.roleId,
          },
        });
      }

      for (const productCategory of backupData.database.productCategories) {
        await tx.productCategory.create({
          data: {
            productId: productCategory.productId,
            categoryId: productCategory.categoryId,
          },
        });
      }

      // Заказы
      for (const order of backupData.database.orders) {
        await tx.order.create({
          data: {
            id: order.id,
            userId: order.userId,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          },
        });
      }

      // Элементы заказов
      for (const orderItem of backupData.database.orderItems) {
        await tx.orderItem.create({
          data: {
            id: orderItem.id,
            orderId: orderItem.orderId,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
            priceAtOrder: orderItem.priceAtOrder,
          },
        });
      }

      // Платежные методы
      for (const paymentMethod of backupData.database.paymentMethods) {
        await tx.paymentMethod.create({
          data: {
            id: paymentMethod.id,
            userId: paymentMethod.userId,
            methodType: paymentMethod.methodType,
            maskedData: paymentMethod.maskedData,
            isDefault: paymentMethod.isDefault,
          },
        });
      }

      // Предпочтения пользователей
      for (const pref of backupData.database.userPreferences) {
        await tx.userPreferences.create({
          data: {
            userId: pref.userId,
            theme: pref.theme,
            dateFormat: pref.dateFormat,
            pageSize: pref.pageSize,
            savedFilters: pref.savedFilters,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Database restored successfully",
      counts: backupData.meta.counts,
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore database" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
