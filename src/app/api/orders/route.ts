import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { generateActivationKey } from "@/utils/generateKey";
import { createAuditLog } from '@/lib/audit';

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

    const activationKeys = items.map(() => generateActivationKey());

    const newOrder = await prisma.order.create({
      data: {
        userId: parseInt(userId),
        totalAmount: parseFloat(total),
        status: "paid",
        paymentMethodId: paymentMethodId ? parseInt(paymentMethodId) : undefined,
      },
    });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const activationKey = activationKeys[i];

      await prisma.orderItem.create({
        data: {
          orderId: newOrder.id,
          userId: parseInt(userId),
          productId: parseInt(item.id),
          quantity: 1,
          priceAtOrder: parseFloat(item.price),
        },
      });

      await prisma.product.update({
        where: { id: parseInt(item.id) },
        data: { added: { increment: 1 } },
      });
    }

    try {
      await createAuditLog({
        userId: Number(userId),
        action: 'create',
        entity: 'order',
        entityId: newOrder.id,
        details: { total, itemsCount: items.length },
      });
    } catch (e) {
      console.warn("Audit log failed:", e);
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${appUrl}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          orderId: newOrder.id,
          items,
          subtotal,
          commission,
          total,
          activationKeys,
        }),
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
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