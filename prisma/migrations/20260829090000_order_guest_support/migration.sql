-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestId" TEXT;

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_guestId_idx" ON "Order"("guestId");