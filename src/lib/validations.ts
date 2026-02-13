import { z } from 'zod';

const emailSchema = z.string().email('Некорректный email').min(1, 'Email обязателен');

const passwordSchema = z.string().min(6, 'Пароль должен быть минимум 6 символов');

const loginSchema = z.string()
  .min(3, 'Логин должен быть минимум 3 символа')
  .max(20, 'Логин не должен превышать 20 символов')
  .regex(/^[a-zA-Z0-9_]+$/, 'Логин может содержать только буквы, цифры и подчеркивание');


export const loginValidationSchema = z.object({
  login: loginSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema,
}).refine(data => data.login || data.email, {
  message: 'Укажите логин или email',
  path: ['login'],
});

export const registerValidationSchema = z.object({
  login: loginSchema,
  email: emailSchema,
  password: passwordSchema,
  passwordConfirm: z.string().min(6, 'Пароль обязателен'),
  consent: z.boolean({ message: 'Необходимо согласие на обработку данных' }).refine(val => val === true, {
    message: 'Необходимо согласие на обработку данных',
  }),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

export const profileUpdateSchema = z.object({
  id: z.number().int('ID должен быть числом'),
  login: loginSchema,
  email: emailSchema,
});

export const checkoutPersonalFormSchema = z.object({
  email: emailSchema,
});


export const productCreateSchema = z.object({
  name: z.string()
    .min(2, 'Название должно быть минимум 2 символа')
    .max(200, 'Название не должно превышать 200 символов'),
  description: z.string()
    .min(10, 'Описание должно быть минимум 10 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  price: z.number()
    .min(0, 'Цена должна быть неотрицательной')
    .max(1000000, 'Цена не должна превышать 1000000'),
  releasedDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате ГГГГ-ММ-ДД'),
  rating: z.number()
    .min(0, 'Рейтинг не может быть меньше 0')
    .max(5, 'Рейтинг не может быть больше 5'),
  website: z.string().url('Некорректный URL').optional().or(z.literal('')),
  background_image: z.string().url('Некорректный URL изображения').optional().or(z.literal('')),
});

export const productUpdateSchema = productCreateSchema.extend({
  id: z.number().int('ID должен быть числом'),
});

export const categoryCreateSchema = z.object({
  name: z.string()
    .min(2, 'Название должно быть минимум 2 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z.string()
    .min(5, 'Описание должно быть минимум 5 символов')
    .max(500, 'Описание не должно превышать 500 символов'),
});

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.number().int('ID должен быть числом'),
});

export const orderCreateSchema = z.object({
  status: z.string()
    .min(2, 'Статус должен быть минимум 2 символа')
    .max(50, 'Статус не должен превышать 50 символов'),
  totalAmount: z.number()
    .min(0, 'Сумма должна быть неотрицательной'),
});

export const orderUpdateSchema = orderCreateSchema.extend({
  id: z.number().int('ID должен быть числом'),
});

export const paymentMethodSchema = z.object({
  methodType: z.string()
    .min(2, 'Тип платежа должен быть минимум 2 символа')
    .max(50, 'Тип платежа не должен превышать 50 символов'),
  maskedData: z.string()
    .min(2, 'Скрытые данные должны быть минимум 2 символа')
    .max(100, 'Скрытые данные не должны превышать 100 символов'),
  isDefault: z.boolean().optional(),
});

export const paymentMethodUpdateSchema = paymentMethodSchema.extend({
  id: z.number().int('ID должен быть числом'),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Страница должна быть минимум 1').optional().default(1),
  page_size: z.number().int().min(1).max(100).optional().default(15),
  search: z.string().max(100, 'Поисковая строка не должна превышать 100 символов').optional().or(z.literal('')),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginValidationSchema>;
export type RegisterInput = z.infer<typeof registerValidationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CheckoutPersonalFormInput = z.infer<typeof checkoutPersonalFormSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
