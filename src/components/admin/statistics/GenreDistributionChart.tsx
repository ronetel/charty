"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PeriodSwitcher } from "./PeriodSwitcher";

interface GenreCount {
  name: string;
  count: number;
}

interface Props {
  data: GenreCount[];
  mode: "month" | "year";
  range: number;
  onRangeChange: (n: number) => void;
}

// Генерируем цвета для жанров
function getGenreColors(genres: string[]): string[] {
  const palette = [
    "#60A5FA", "#F59E0B", "#34D399", "#F87171", "#A78BFA", "#F472B6", "#38BDF8",
    "#FFB300", "#FF7043", "#8D6E63", "#26A69A", "#D4E157", "#7E57C2", "#EC407A", "#789262"
  ];
  return genres.map((_, idx) => palette[idx % palette.length]);
}

export const GenreDistributionChart: React.FC<Props> = ({ data, mode, range, onRangeChange }) => {
  const genreNames = data.map(g => g.name);
  const colors = getGenreColors(genreNames);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: "#fff" }}>Распределение игр по жанрам</h4>
        <PeriodSwitcher mode={mode} value={range} onChange={onRangeChange} />
      </div>
      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {data.map((genre, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ color: "#A1A1A1" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
