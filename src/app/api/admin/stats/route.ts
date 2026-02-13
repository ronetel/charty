import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  const timings: Record<string, number> = {};
  const tStart = Date.now();
  try {
    console.time("stats:total");
    // Получаем базовую статистику
    const t0 = Date.now();
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
    timings.basicCounts = Date.now() - t0;

    // Получаем заказы за последние 365 дней для графиков
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const t1 = Date.now();
    const ordersLastYear = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        totalAmount: true,
      },
    });
    timings.ordersLastYear = Date.now() - t1;

    const t2 = Date.now();
    const usersLastYear = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });
    timings.usersLastYear = Date.now() - t2;

    // Группируем данные по дням (последние 30 дней)
    const dailyStats: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyStats[dateStr] = { revenue: 0, orders: 0 };
    }

    ordersLastYear.forEach((order) => {
      const dateStr = order.createdAt!.toISOString().split("T")[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].revenue += Number(order.totalAmount || 0);
        dailyStats[dateStr].orders += 1;
      }
    });

    const dailyData = Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }));

    // Группируем данные по месяцам (последний год)
    const monthlyStats: Record<string, { revenue: number; orders: number; users: number }> = {};
    const monthNames = [
      "Янв", "Фев", "Мар", "Апр", "Май", "Июн",
      "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"
    ];

    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyStats[monthKey] = { revenue: 0, orders: 0, users: 0 };
    }

    ordersLastYear.forEach((order) => {
      const date = order.createdAt!;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].revenue += Number(order.totalAmount || 0);
        monthlyStats[monthKey].orders += 1;
      }
    });

    usersLastYear.forEach((user) => {
      const date = user.createdAt!;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].users += 1;
      }
    });

    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => {
        const [year, month] = monthKey.split("-");
        return {
          month: monthNames[parseInt(month) - 1],
          year,
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.orders,
          users: data.users,
        };
      });

    // Дополнительные агрегации: топ товаров и выручка по категориям (за последний год), а также топы по количеству и по жанрам
    const t3 = Date.now();
    const orderItemsWithProducts = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: oneYearAgo } } },
      include: { product: { include: { categories: { include: { category: true } } } } },
    });
    timings.orderItemsWithProducts = Date.now() - t3;

    const topMap = new Map<number, { id: number; name: string; revenue: number; quantity: number }>();
    const categoryMap = new Map<string, { name: string; revenue: number }>();

    orderItemsWithProducts.forEach((oi) => {
      const pid = oi.productId;
      const revenueAmount = Number(oi.priceAtOrder || 0) * (oi.quantity || 1);

      if (!topMap.has(pid)) {
        topMap.set(pid, { id: pid, name: oi.product?.name || `#${pid}`, revenue: 0, quantity: 0 });
      }
      const t = topMap.get(pid)!;
      t.revenue += revenueAmount;
      t.quantity += oi.quantity || 1;

      const cats = oi.product?.categories || [];
      if (cats.length === 0) {
        const key = "Без категории";
        const c = categoryMap.get(key) || { name: key, revenue: 0 };
        c.revenue += revenueAmount;
        categoryMap.set(key, c);
      } else {
        cats.forEach((pc) => {
          const key = pc.category?.name || "Без категории";
          const c = categoryMap.get(key) || { name: key, revenue: 0 };
          c.revenue += revenueAmount;
          categoryMap.set(key, c);
        });
      }
    });

    const topProducts = Array.from(topMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    const revenueByCategory = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Top by quantity
    const topByQuantity = Array.from(topMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((t) => ({ id: t.id, name: t.name, quantity: t.quantity, revenue: t.revenue }));

    // Top by genre (quantity)
    const genreMap = new Map<string, { genre: string; quantity: number; revenue: number }>();
    orderItemsWithProducts.forEach((oi) => {
      const qty = oi.quantity || 0;
      const rev = Number(oi.priceAtOrder || 0) * qty;
      const cats = oi.product?.categories || [];
      if (cats.length === 0) {
        const key = "Без категории";
        const v = genreMap.get(key) || { genre: key, quantity: 0, revenue: 0 };
        v.quantity += qty;
        v.revenue += rev;
        genreMap.set(key, v);
      } else {
        cats.forEach((pc) => {
          const key = pc.category?.name || "Без категории";
          const v = genreMap.get(key) || { genre: key, quantity: 0, revenue: 0 };
          v.quantity += qty;
          v.revenue += rev;
          genreMap.set(key, v);
        });
      }
    });
    const topByGenre = Array.from(genreMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    // Distribution of games by genre (count of products per category)
    const t4 = Date.now();
    const productsWithCategories = await prisma.product.findMany({ include: { categories: { include: { category: true } } } });
    timings.productsWithCategories = Date.now() - t4;
    const genreCounts = new Map<string, number>();
    productsWithCategories.forEach((p) => {
      const cats = p.categories || [];
      if (cats.length === 0) {
        const key = "Без категории";
        genreCounts.set(key, (genreCounts.get(key) || 0) + 1);
      } else {
        cats.forEach((pc) => {
          const key = pc.category?.name || "Без категории";
          genreCounts.set(key, (genreCounts.get(key) || 0) + 1);
        });
      }
    });
    const genreDistribution = Array.from(genreCounts.entries()).map(([name, count]) => ({ name, count }));

    // Пользовательская активность: регистрации, активные пользователи (за 7д), покупатели за день
    // Подготовим регистрации и покупателей по дням для последних 30 дней
    const dailyActivity: { date: string; registrations: number; activeUsers: number; buyers: number; guests?: null }[] = [];

    // Prepare map of registrations per day
    const regMap = new Map<string, number>();
    usersLastYear.forEach((u) => {
      const d = u.createdAt!.toISOString().split("T")[0];
      regMap.set(d, (regMap.get(d) || 0) + 1);
    });

    // Map orders by date and collect userIds for buyer counting
    const ordersByDate = new Map<string, Set<number>>();
    ordersLastYear.forEach((o) => {
      const d = o.createdAt!.toISOString().split("T")[0];
      if (!ordersByDate.has(d)) ordersByDate.set(d, new Set());
      ordersByDate.get(d)!.add(o.userId);
    });

    // For active users 7d window, we will consider users who had orders in the 7-day window ending on the date OR were created/updated in that window
    const usersAll = await prisma.user.findMany({ select: { id: true, createdAt: true, updatedAt: true } });

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // registrations
      const registrations = regMap.get(dateStr) || 0;

      // buyers = distinct users who placed orders that day
      const buyers = ordersByDate.get(dateStr) ? ordersByDate.get(dateStr)!.size : 0;

      // active users in last 7 days ending at dateStr
      const windowStart = new Date(date);
      windowStart.setDate(windowStart.getDate() - 6);
      const ws = windowStart.toISOString().split("T")[0];
      const activeSet = new Set<number>();

      // orders in window
      for (const [d, set] of ordersByDate.entries()) {
        if (d >= ws && d <= dateStr) {
          set.forEach((uid: number) => activeSet.add(uid));
        }
      }

      // users created/updated in window
      usersAll.forEach((u) => {
        const c = u.createdAt.toISOString().split("T")[0];
        const up = u.updatedAt.toISOString().split("T")[0];
        if ((c >= ws && c <= dateStr) || (up >= ws && up <= dateStr)) activeSet.add(u.id);
      });

      dailyActivity.push({ date: dateStr, registrations, activeUsers: activeSet.size, buyers, guests: null });
    }

    const stats = {
      summary: {
        games: gamesCount,
        users: usersCount,
        orders: ordersCount,
        revenue: parseFloat((revenue._sum.totalAmount || 0).toString()),
        categories: categoriesCount,
        activeGames: activeGamesCount,
      },
      daily: dailyData,
      monthly: monthlyData,
      topProducts,
      revenueByCategory,
      topSoldByQuantity: topByQuantity,
      topByGenre,
      genreDistribution,
      userActivity: dailyActivity,
    };

    timings.total = Date.now() - tStart;
    console.timeEnd("stats:total");

    const { searchParams } = new URL(request.url);
    const debug = searchParams.get("debug") === "1";
    if (debug) {
      // include timings for debugging in response
      return NextResponse.json({ ...stats, __timings: timings });
    }
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
