"use client";
import React from "react";

interface Props {
  mode: "month" | "year";
  value: number;
  onChange: (v: number) => void;
}

export const PeriodSwitcher: React.FC<Props> = ({ mode, value, onChange }) => {
  const presets = mode === "month" ? [7, 14, 30] : [6, 12, 24];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {presets.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            background: p === value ? "#83B4FF" : "#2A2A2A",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {mode === "month" ? `${p}д` : `${p}м`}
        </button>
      ))}
    </div>
  );
};
