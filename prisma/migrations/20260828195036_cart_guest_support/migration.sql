/*
  Warnings:

  - A unique constraint covering the columns `[guestId,lineId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_guestId_lineId_key" ON "CartItem"("guestId", "lineId");
