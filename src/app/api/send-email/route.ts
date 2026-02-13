import { NextRequest, NextResponse } from 'next/server';
import { getOrderReceiptTemplate } from '@/components/email/check';
import { sendVerificationEmail } from '@/components/email/send-email';

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
    if ((body as any).type === 'register') {
      const email = (body as any).email;
      const code = (body as any).code || Math.floor(100000 + Math.random() * 900000).toString();
      const html = `<p>Код для подтверждения регистрации: <strong>${code}</strong></p><p>Он действителен 1 час.</p>`;
      try {
        await sendVerificationEmail(email, 'Код подтверждения регистрации', html);
        return NextResponse.json({ success: true, message: 'Email отправлено' });
      } catch (mailError) {
        console.error('Mail send failed:', mailError);
        return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
      }
    }

    const { email, orderId, items, subtotal, commission, total, activationKeys } = body;

    console.log('📧 Отправка письма на:', email);
    console.log('📋 Заказ #' + orderId);
    console.log('💳 Сумма:', total);
    console.log('🎮 Ключи:', activationKeys);

    const htmlTemplate = getOrderReceiptTemplate(orderId, items, subtotal, commission, total, email, activationKeys);

    try {
      await sendVerificationEmail(email, `Ваш заказ #${orderId} — подтверждение и ключи`, htmlTemplate);
      return NextResponse.json({ success: true, message: 'Email отправлено', orderId });
    } catch (mailError) {
      console.error('Mail send failed:', mailError);
      return NextResponse.json({ success: false, message: 'Failed to send email', orderId }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
