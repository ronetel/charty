"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailyPoint, MonthlyPoint } from "./types";
import { PeriodSwitcher } from "./PeriodSwitcher";

interface Props {
  daily: DailyPoint[];
  monthly: MonthlyPoint[];
  mode: "month" | "year";
  range: number;
  onRangeChange: (n: number) => void;
}

export const OrdersChart: React.FC<Props> = ({ daily, monthly, mode, range, onRangeChange }) => {
  const data = mode === "month" ? daily.slice(-range) : monthly.slice(-range).map(m => ({ ...m, label: `${m.month} '${m.year.slice(-2)}` }));

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>Заказы</h4>
        <PeriodSwitcher mode={mode} value={range} onChange={onRangeChange} />
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data as any}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey={mode === "month" ? "date" : "label"} stroke="#A1A1A1" />
            <YAxis stroke="#A1A1A1" />
            <Tooltip />
            <Bar dataKey="orders" fill="#667eea" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
