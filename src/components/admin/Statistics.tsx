"use client";
import styles from "@/styles/admin.module.scss";

interface DailyData {
  date: string;
  revenue: number;
  orders: number;
}

interface MonthlyData {
  month: string;
  year: string;
  revenue: number;
  orders: number;
  users: number;
}

interface StatsData {
  summary: {
    games: number;
    users: number;
    orders: number;
    revenue: number;
    categories: number;
    activeGames: number;
  };
  daily: DailyData[];
  monthly: MonthlyData[];
  topProducts?: { id: number; name: string; revenue: number; quantity: number }[];
  revenueByCategory?: { name: string; revenue: number }[];
}

import React, { useEffect, useState } from "react";
import fetchWithTiming from "@/lib/fetchWithTiming";
import { StatCard } from "@/components/admin/Stats/StatCard";
import { statsContainerStyles } from "@/styles/adminStyles";
import { RevenueChart } from "@/components/admin/statistics/RevenueChart";
import { OrdersChart } from "@/components/admin/statistics/OrdersChart";
import { TopProductsChart } from "@/components/admin/statistics/TopProductsChart";
import { TopSoldChart } from "@/components/admin/statistics/TopSoldChart";
import { TopByGenreChart } from "@/components/admin/statistics/TopByGenreChart";
import { GenreDistributionChart } from "@/components/admin/statistics/GenreDistributionChart";
import { UserActivityChart } from "@/components/admin/statistics/UserActivityChart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Statistics() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const [dailyRange, setDailyRange] = useState<number>(30);
  const [monthlyRange, setMonthlyRange] = useState<number>(12);
  const [topProductsLimit, setTopProductsLimit] = useState<number>(5);
  // per-chart modes and ranges
  const [revenueMode, setRevenueMode] = useState<"month" | "year">("month");
  const [revenueRange, setRevenueRange] = useState<number>(30);
  const [ordersMode, setOrdersMode] = useState<"month" | "year">("month");
  const [ordersRange, setOrdersRange] = useState<number>(30);
  const [topMode, setTopMode] = useState<"month" | "year">("month");
  const [topRange, setTopRange] = useState<number>(5);
  const [userMode, setUserMode] = useState<"month" | "year">("month");
  const [userRange, setUserRange] = useState<number>(30);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line
  }, []);

  const loadStats = async () => {
    const start = performance.now();
    try {
      const token = localStorage.getItem("admin_token");
      const url = "/api/admin/stats?debug=1";
      const res = await fetchWithTiming(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      if ((data as any).__timings) console.table((data as any).__timings);
      setStats(data);
    } catch (err) {
      setError("Ошибка загрузки статистики");
      console.error(err);
    } finally {
      setLoading(false);
      console.info(`[stats] loadStats completed in ${Math.round(performance.now() - start)}ms`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ color: "#A1A1A1" }}>Загрузка статистики...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1A1A1A",
          borderRadius: "12px",
          color: "#FF8383",
        }}
      >
        {error}
      </div>
    );
  }

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #262626",
            borderRadius: "6px",
            padding: "12px",
            color: "#FFFFFF",
          }}
        >
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: "4px 0", color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // фильтры для отображения
  const filteredDaily = stats.daily.slice(-dailyRange);
  const filteredMonthly = stats.monthly.slice(-monthlyRange);
  const topProductsData = (stats.topProducts || []).slice(0, topProductsLimit);

  return (
    <section className={styles.statistics_section}>
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "24px",
            color: "#FFFFFF",
          }}
        >
          📊 Статистика и аналитика
        </h2>

        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <StatCard title="Всего игр" value={stats.summary.games} icon="🎮" color="#FF6B6B" />
          <StatCard title="Активных игр" value={stats.summary.activeGames} icon="✅" color="#4ECDC4" />
          <StatCard title="Категорий" value={stats.summary.categories} icon="📁" color="#45B7D1" />
          <StatCard title="Пользователей" value={stats.summary.users} icon="👥" color="#95E1D3" />
          <StatCard title="Заказов" value={stats.summary.orders} icon="📦" color="#F368E0" />
          <StatCard title="Выручка" value={`₽${Number(stats.summary.revenue).toLocaleString()}`} icon="💰" color="#FFD166" />
        </div>

        
        <div style={statsContainerStyles.wrapper}>

          
          {activeTab === "daily" && (
            <div>
              <RevenueChart
                daily={filteredDaily}
                monthly={filteredMonthly}
                mode={revenueMode}
                range={revenueRange}
                onRangeChange={setRevenueRange}
              />

              <OrdersChart
                daily={filteredDaily}
                monthly={filteredMonthly}
                mode={ordersMode}
                range={ordersRange}
                onRangeChange={setOrdersRange}
              />

              
              <UserActivityChart
                data={((stats as any).userActivity as any) || []}
                mode={userMode}
                range={userRange}
                onRangeChange={setUserRange}
              />

              <TopSoldChart
                data={((stats as any).topSoldByQuantity as any) || []}
                mode={topMode}
                range={topRange}
                onRangeChange={setTopRange}
              />

              <TopByGenreChart
                data={((stats as any).topByGenre as any) || []}
                mode={topMode}
                range={topRange}
                onRangeChange={setTopRange}
              />

              <GenreDistributionChart
                data={((stats as any).genreDistribution as any) || []}
                mode={topMode}
                range={topRange}
                onRangeChange={setTopRange}
              />
            </div>
          )}

          
          {activeTab === "monthly" && (
            <div>
              <RevenueChart
                daily={filteredDaily}
                monthly={filteredMonthly}
                mode={revenueMode === "month" ? "year" : "year"}
                range={monthlyRange}
                onRangeChange={setMonthlyRange}
              />

              <TopProductsChart
                data={topProductsData}
                mode={topMode}
                range={topRange}
                onRangeChange={setTopRange}
              />

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>Выручка по категориям</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.revenueByCategory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="name" stroke="#A1A1A1" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#A1A1A1" style={{ fontSize: "12px" }} />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: "#A1A1A1" }} />
                    <Bar dataKey="revenue" fill="#67E8F9" name="Выручка (₽)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#FFFFFF", marginBottom: 12 }}>Новые пользователи по месяцам</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthly.map((m) => ({ ...m, month: `${m.month} '${m.year.slice(-2)}` }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="month" stroke="#A1A1A1" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#A1A1A1" style={{ fontSize: "12px" }} />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: "#A1A1A1" }} />
                    <Line type="monotone" dataKey="users" stroke="#4ECDC4" strokeWidth={2} name="Новые пользователи" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// (удалено дублирующее определение StatCard)
