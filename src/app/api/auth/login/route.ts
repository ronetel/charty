import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../../../lib/prisma';
import { signToken } from '../../../../../lib/jwt';
import { loginValidationSchema } from '../../../../lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Валидация входных данных
    const validationResult = loginValidationSchema.safeParse({
      email: body.email,
      login: body.login,
      password: body.password,
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

    const email = body.email, password = body.password, login = body.login 

    if (!email && !login) {
      return NextResponse.json(
        { error: 'Укажите логин или email' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: email ? { email } : { login },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неправильные учетные данные' },
        { status: 401 }
      );
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: 'Неправильные учетные данные' },
        { status: 401 }
      );
    }

    const roles = (user.roles || []).map((r: any) => r.role?.name).filter(Boolean);

    const token = signToken({ id: user.id, email: user.email, roles });
    try {
      await createAuditLog({ userId: user.id, action: 'login', entity: 'auth', entityId: user.id, details: { via: email ? 'email' : 'login' } });
    } catch (e) {}

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        roles
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
