import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Получаем статистику из базы данных
    const [
      gamesCount,
      usersCount,
      ordersCount,
      revenue,
      categoriesCount,
      activeGamesCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.category.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    const stats = {
      games: gamesCount,
      users: usersCount,
      orders: ordersCount,
      revenue: parseFloat((revenue._sum.totalAmount || 0).toString()),
      categories: categoriesCount,
      activeGames: activeGamesCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
