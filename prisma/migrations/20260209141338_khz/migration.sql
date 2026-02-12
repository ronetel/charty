/*
  Warnings:

  - A unique constraint covering the columns `[rawgSlug]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "products_rawgId_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_rawgSlug_key" ON "products"("rawgSlug");
