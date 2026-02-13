import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      users,
      roles,
      userRoles,
      userPreferences,
      categories,
      products,
      productCategories,
      orders,
      orderItems,
      paymentMethods,
    ] = await Promise.all([
      prisma.user.findMany({
        include: {
          roles: true,
          preferences: true,
          orders: true,
          paymentMethods: true,
        },
      }),
      prisma.role.findMany(),
      prisma.userRole.findMany(),
      prisma.userPreferences.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany({
        include: {
          categories: true,
          orderItems: true,
        },
      }),
      prisma.productCategory.findMany(),
      prisma.order.findMany({
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              login: true,
            },
          },
        },
      }),
      prisma.orderItem.findMany(),
      prisma.paymentMethod.findMany(),
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      exportedBy: "admin",
      version: "1.0",
      database: {
        users,
        roles,
        userRoles,
        userPreferences,
        categories,
        products,
        productCategories,
        orders,
        orderItems,
        paymentMethods,
      },
      meta: {
        counts: {
          users: users.length,
          roles: roles.length,
          categories: categories.length,
          products: products.length,
          orders: orders.length,
          paymentMethods: paymentMethods.length,
        },
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    try {
      const authHeader = request.headers.get("authorization") || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
      const payload = verifyToken(token || '');
      await createAuditLog({ userId: payload?.id, action: 'export', entity: 'backup', details: { counts: backupData.meta.counts } });
    } catch (e) {}

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 },
    );
  }
}
