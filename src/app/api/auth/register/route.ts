import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { signToken } from '../../../../../lib/jwt';
import { registerValidationSchema } from '../../../../lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Валидация входных данных
    const validationResult = registerValidationSchema.safeParse({
      name: body.name,
      email: body.email,
      login: body.login,
      password: body.password,
      passwordConfirm: body.passwordConfirm,
      consent: body.consent,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json(
        { error: 'Ошибка валидации', errors },
        { status: 400 }
      );
    }

    const {  email, password, login } = validationResult.data;

    // Проверка на существование пользователя
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { login: login.toLowerCase() }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Такой пользователь уже существует' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const created = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        login: login.toLowerCase(),
      },
    });

    try {
      await createAuditLog({ userId: created.id, action: 'register', entity: 'user', entityId: created.id, details: { email: created.email, login: created.login } });
    } catch (e) {}

    // Генерация токена
    const token = signToken({
      id: created.id,
      email: created.email,
      roles: []
    });

    const user = {
      id: created.id,
      email: created.email,
      login: created.login,
    };

    return NextResponse.json({ token, user });
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
