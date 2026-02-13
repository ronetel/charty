"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TopProduct } from "./types";
import { PeriodSwitcher } from "./PeriodSwitcher";

interface GenrePoint {
  genre: string;
  quantity: number;
  revenue?: number;
}

interface Props {
  data: GenrePoint[];
  mode: "month" | "year";
  range: number;
  onRangeChange: (n: number) => void;
}

export const TopByGenreChart: React.FC<Props> = ({ data, mode, range, onRangeChange }) => {
  const shown = data.slice(0, 10);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>Топ жанров (по продажам)</h4>
        <PeriodSwitcher mode={mode} value={range} onChange={onRangeChange} />
      </div>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={shown} layout="vertical">
            <XAxis type="number" stroke="#A1A1A1" />
            <YAxis dataKey="genre" type="category" stroke="#A1A1A1" width={220} />
            <Tooltip />
            <Bar dataKey="quantity" fill="#60A5FA" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
