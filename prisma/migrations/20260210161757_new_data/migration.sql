/*
  Warnings:

  - A unique constraint covering the columns `[rawgId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "products_rawgSlug_key";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "added" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metacritic" INTEGER,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "website" VARCHAR(500);

-- CreateIndex
CREATE UNIQUE INDEX "products_rawgId_key" ON "products"("rawgId");
