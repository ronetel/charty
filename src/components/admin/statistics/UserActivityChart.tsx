"use client";
import React from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { PeriodSwitcher } from "./PeriodSwitcher";

interface ActivityPoint {
  date: string;
  registrations: number;
  activeUsers: number;
  guests?: number;
  buyers?: number;
}

interface Props {
  data: ActivityPoint[];
  mode: "month" | "year";
  range: number;
  onRangeChange: (n: number) => void;
}

export const UserActivityChart: React.FC<Props> = ({ data, mode, range, onRangeChange }) => {
  const shown = data.slice(-range);

  // compute conversion percentage guests->registrations->buyers
  const withConversion = shown.map(d => ({
    ...d,
    regRate: d.guests ? (d.registrations / d.guests) * 100 : 0,
    buyRate: d.registrations ? (d.buyers ? (d.buyers / d.registrations) * 100 : 0) : 0,
  }));

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>Активность пользователей</h4>
        <PeriodSwitcher mode={mode} value={range} onChange={onRangeChange} />
      </div>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={withConversion}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="date" stroke="#A1A1A1" />
            <YAxis yAxisId="left" stroke="#A1A1A1" />
            <YAxis yAxisId="right" orientation="right" stroke="#A1A1A1" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="activeUsers" fill="#34D399" name="Активные (7d)" />
            <Line yAxisId="left" type="monotone" dataKey="registrations" stroke="#83B4FF" name="Новые регист." />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
