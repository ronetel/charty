import type { TableName } from "./types";

export const TABLES: TableName[] = [
  "products",
  "categories",
  "users",
  "roles",
  "orders",
  "paymentMethods",
];

export const TABLE_LABELS: Record<TableName, string> = {
  products: "Товары",
  categories: "Категории",
  users: "Пользователи",
  roles: "Роли",
  orders: "Заказы",
  paymentMethods: "Способы оплаты",
};

export const TABLE_FIELDS: Record<TableName, string[]> = {
  products: ["name", "description", "price", "releasedDate", "rating", "website", "background_image"],
  categories: ["name", "description"],
  users: ["email", "login", "isActive"],
  roles: ["name"],
  orders: ["status", "totalAmount"],
  paymentMethods: ["methodType", "maskedData", "isDefault"],
};

export const FIELD_LABELS: Record<string, string> = {
  name: "Название",
  description: "Описание",
  price: "Цена",
  email: "Email",
  login: "Логин",
  isActive: "Активный",
  status: "Статус",
  totalAmount: "Сумма",
  methodType: "Тип платежа",
  maskedData: "Скрытые данные",
  isDefault: "По умолчанию",
  releasedDate: "Дата выпуска",
  rating: "Рейтинг",
  website: "Веб-сайт",
  background_image: "URL изображения",
};
