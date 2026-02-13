"use client";
import React from "react";
import { statCardStyles } from "../../../styles/adminStyles";

export function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <div style={{ ...statCardStyles.container, borderColor: color }}>
      <div style={statCardStyles.header}>
        <span style={{ ...statCardStyles.icon, color }}>{icon}</span>
        <span style={statCardStyles.title}>{title}</span>
      </div>
      <div style={statCardStyles.value}>{value}</div>
    </div>
  );
}
