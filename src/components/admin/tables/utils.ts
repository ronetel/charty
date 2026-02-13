import { FIELD_LABELS } from "./constants";

export const getLabelForField = (field: string): string => {
  return FIELD_LABELS[field] || field;
};

export const getTokenHeader = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0];
};

export const isDateField = (fieldName: string): boolean => {
  return fieldName === "releasedDate";
};

export const isNumberField = (fieldName: string): boolean => {
  return ["price", "totalAmount", "rating"].includes(fieldName);
};

export const isBooleanField = (fieldName: string, tableName: string): boolean => {
  if (tableName === "users" && fieldName === "isActive") return true;
  if (tableName === "paymentMethods" && fieldName === "isDefault") return true;
  return false;
};

export const isTextareaField = (fieldName: string): boolean => {
  return fieldName === "description";
};

export const formatCellValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") {
    return value ? "✓ Да" : "✗ Нет";
  }

  if (fieldName === "price" || fieldName === "totalAmount") {
    return `${Number(value).toFixed(2)}₽`;
  }

  if (fieldName === "rating") {
    return Number(value).toFixed(1);
  }

  if (fieldName === "releasedDate") {
    if (!value) return "—";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("ru-RU");
  }

  return String(value);
};
