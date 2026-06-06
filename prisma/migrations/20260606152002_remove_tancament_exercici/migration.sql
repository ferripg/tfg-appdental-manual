/*
  Warnings:

  - You are about to drop the `TancamentExercici` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TancamentExercici" DROP CONSTRAINT "TancamentExercici_reobertPerId_fkey";

-- DropForeignKey
ALTER TABLE "TancamentExercici" DROP CONSTRAINT "TancamentExercici_tancatPerId_fkey";

-- DropTable
DROP TABLE "TancamentExercici";
