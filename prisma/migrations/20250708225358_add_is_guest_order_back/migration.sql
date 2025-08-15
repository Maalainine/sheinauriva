-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isGuestOrder" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Order_isGuestOrder_idx" ON "Order"("isGuestOrder");
