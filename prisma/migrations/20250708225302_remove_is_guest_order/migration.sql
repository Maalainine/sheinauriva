/*
  Warnings:

  - You are about to drop the column `isGuestOrder` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_isGuestOrder_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isGuestOrder";
