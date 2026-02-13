export const getOrderReceiptTemplate = (
  orderId: string,
  items: Array<{ id: number; name: string; price: string }>,
  subtotal: number,
  commission: number,
  totalAmount: number,
  email: string,
  activationKeys: string[]
): string => {
  const itemsList = items
    .map(
      (item, index) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₽${item.price}</td>
        </tr>`
    )
    .join('');

  const keysList = activationKeys
    .map(
      (key, index) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${items[index]?.name || 'Игра'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #2563eb;">${key}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2563eb; margin: 0;">Спасибо за ваш заказ!</h2>
        <p style="color: #64748b; margin-top: 10px;">Заказ #${orderId}</p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1e293b; margin-top: 0;">Детали заказа</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Название</th>
              <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e2e8f0;">Кол-во</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #64748b;">Сумма товаров:</span>
            <span style="color: #1e293b; font-weight: bold;">₽${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #64748b;">Комиссия (10%):</span>
            <span style="color: #1e293b; font-weight: bold;">₽${commission.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            <span style="color: #1e293b; font-weight: bold;">Итого:</span>
            <span style="color: #2563eb; font-weight: bold;">₽${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
        <h3 style="color: #1e293b; margin-top: 0;">🎮 Ключи активации</h3>
        <p style="color: #64748b; margin-top: 0;">Используйте эти ключи для активации ваших игр:</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Игра</th>
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Ключ</th>
            </tr>
          </thead>
          <tbody>
            ${keysList}
          </tbody>
        </table>

        <p style="color: #f97316; font-size: 12px; margin-top: 15px; margin-bottom: 0;">
          ⚠️ Сохраните эти ключи в безопасном месте. Их нельзя восстановить!
        </p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1e293b; margin-top: 0;">📧 Контактная информация</h3>
        <p style="color: #64748b; margin: 8px 0;">
          <strong>Email:</strong> ${email}
        </p>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 12px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p>Спасибо, что выбрали наш магазин!</p>
        <p style="margin: 0;">© 2026 Charty. Все права защищены.</p>
      </div>
    </div>
  `;
};

