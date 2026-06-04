/*
  Warnings:

  - A unique constraint covering the columns `[numInventari]` on the table `Inventari` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Inventari" ADD COLUMN     "numInventari" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Inventari_numInventari_key" ON "Inventari"("numInventari");
