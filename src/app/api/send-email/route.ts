import { NextRequest, NextResponse } from 'next/server';
import { getOrderReceiptTemplate } from '@/components/email/check';

interface SendEmailRequest {
  email: string;
  orderId: string;
  items: Array<{ id: number; name: string; price: string }>;
  subtotal: number;
  commission: number;
  total: number;
  activationKeys: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();

    const { email, orderId, items, subtotal, commission, total, activationKeys } = body;

    console.log('📧 Отправка письма на:', email);
    console.log('📋 Заказ #' + orderId);
    console.log('💳 Сумма:', total);
    console.log('🎮 Ключи:', activationKeys);

    const htmlTemplate = getOrderReceiptTemplate(
      orderId,
      items,
      subtotal,
      commission,
      total,
      email,
      activationKeys
    );

    return NextResponse.json({
      success: true,
      message: 'Email отправлено успешно (в режиме демонстрации)',
      orderId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
