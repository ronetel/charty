import { PeriodMode } from "./types";

export const formatDateToLabel = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  } catch {
    return dateStr;
  }
};

export const getRangeLabel = (mode: PeriodMode, value: number) => {
  if (mode === "month") return `${value} дней`;
  return `${value} месяцев`;
};
