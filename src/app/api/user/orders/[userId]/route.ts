import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Получаем заказы пользователя из базы данных
    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Преобразуем данные в формат, совместимый с вашим интерфейсом
    const formattedOrders = orders.map((order) => ({
      id: `order_${order.id}`,
      user_id: userId,
      email: "", // Можно добавить, если нужно
      items: order.items.map((item) => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.price.toString(),
      })),
      subtotal: order.items.reduce(
        (sum, item) => sum + parseFloat(item.priceAtOrder.toString()),
        0,
      ),
      commission: 0, // Можно рассчитать или сохранить в базе
      total: parseFloat(order.totalAmount.toString()),
      status: order.status as "pending" | "completed" | "cancelled",
      created_at: order.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке заказов" },
      { status: 500 },
    );
  }
}
