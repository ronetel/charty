import { z } from "zod";
import type { TableName } from "./types";

export const validationSchemas: Record<TableName, z.ZodSchema<any>> = {
  products: z.object({
    name: z.string().min(2, "Название обязательно и минимум 2 символа"),
    description: z.string().min(10, "Описание минимум 10 символов"),
    price: z.coerce.number().min(0, "Цена должна быть неотрицательной"),
    releasedDate: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), { 
      message: "Дата выпуска обязательна и должна быть в формате ГГГГ-ММ-ДД" 
    }),
    rating: z.coerce.number().min(0).max(5, "Рейтинг от 0 до 5"),
    website: z
      .string()
      .url("Веб-сайт должен быть валидным URL")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    background_image: z
      .string()
      .url("URL изображения должен быть валидным")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  }),
  categories: z.object({
    name: z.string().min(2, "Название обязательно и минимум 2 символа"),
    description: z.string().min(5, "Описание минимум 5 символов"),
  }),
  users: z.object({
    email: z.string().email("Email должен быть валидным"),
    login: z.string().min(3, "Логин минимум 3 символа"),
    isActive: z.boolean(),
  }),
  roles: z.object({
    name: z.string().min(2, "Название обязательно и минимум 2 символа"),
  }),
  orders: z.object({
    status: z.string().min(2, "Статус минимум 2 символа"),
    totalAmount: z.coerce.number().min(0, "Сумма должна быть неотрицательной"),
  }),
  paymentMethods: z.object({
    methodType: z.string().min(2, "Тип платежа минимум 2 символа"),
    maskedData: z.string().min(2, "Скрытые данные минимум 2 символа"),
    isDefault: z.boolean(),
  }),
};
