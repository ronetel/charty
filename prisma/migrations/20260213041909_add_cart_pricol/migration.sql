-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentMethodId" INTEGER;

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "cardHolder" VARCHAR(200),
ADD COLUMN     "expiryDate" VARCHAR(10);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
