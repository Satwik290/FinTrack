/*
  Warnings:

  - You are about to drop the column `amount` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `limit` to the `Budget` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchant` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "amount",
ADD COLUMN     "limit" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "period" SET DEFAULT 'monthly';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "description",
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "merchant" TEXT NOT NULL,
ADD COLUMN     "note" TEXT;
