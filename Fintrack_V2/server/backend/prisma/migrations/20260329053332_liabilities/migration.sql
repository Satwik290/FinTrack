-- DropForeignKey
ALTER TABLE "Liability" DROP CONSTRAINT "Liability_userId_fkey";

-- AlterTable
ALTER TABLE "Liability" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "dueDate" TEXT,
ADD COLUMN     "emiInCents" INTEGER;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
