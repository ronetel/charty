import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Charty | Оформление заказа',
  description: 'Страница оформления заказа',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {children}
    </main>
  );
}
