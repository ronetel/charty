export type PeriodMode = "month" | "year";

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
  visitors?: number;
}

export interface MonthlyPoint {
  month: string; // e.g. "Jan"
  year: string; // full year
  revenue: number;
  orders: number;
  users?: number;
}

export interface TopProduct {
  id: number;
  name: string;
  revenue: number;
  quantity: number;
}
