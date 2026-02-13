"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TopProduct } from "./types";
import { PeriodSwitcher } from "./PeriodSwitcher";

interface Props {
  data: TopProduct[];
  mode: "month" | "year";
  range: number;
  onRangeChange: (n: number) => void;
}

export const TopSoldChart: React.FC<Props> = ({ data, mode, range, onRangeChange }) => {
  const shown = data.slice(0, 10);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>Топ-10 продаваемых (по количеству)</h4>
        <PeriodSwitcher mode={mode} value={range} onChange={onRangeChange} />
      </div>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={shown} layout="vertical">
            <XAxis type="number" stroke="#A1A1A1" />
            <YAxis dataKey="name" type="category" stroke="#A1A1A1" width={220} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
