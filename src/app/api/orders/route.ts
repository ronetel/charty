import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { generateActivationKey } from "@/utils/generateKey";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      email,
      items,
      paymentMethodId,
      subtotal,
      commission,
      total,
    } = body;

    if (
      !userId ||
      !email ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Недостаточно данных для создания заказа" },
        { status: 400 },
      );
    }

    // Генерируем ключи активации для каждого товара
    const activationKeys = items.map(() => generateActivationKey());

    // Создаем заказ в транзакции
    const order = await prisma.$transaction(async (tx) => {
      // Создаем заказ
      const newOrder = await tx.order.create({
        data: {
          userId: parseInt(userId),
          totalAmount: parseFloat(total),
          status: "pending",
        },
      });

      // Создаем элементы заказа и уменьшаем количество на складе
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const activationKey = activationKeys[i];

        // Создаем элемент заказа
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: parseInt(item.id),
            quantity: 1,
            priceAtOrder: parseFloat(item.price),
          },
        });

        // Уменьшаем количество товара на складе
        await tx.product.update({
          where: { id: parseInt(item.id) },
          data: {
            stockQuantity: {
              decrement: 1,
            },
            added: {
              increment: 1,
            },
          },
        });
      }

      return newOrder;
    });

    // Отправляем письмо с информацией о заказе
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${appUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          orderId: order.id,
          items,
          subtotal,
          commission,
          total,
          activationKeys,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Не прерываем выполнение, если письмо не отправилось
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      activationKeys,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании заказа" },
      { status: 500 },
    );
  }
}
