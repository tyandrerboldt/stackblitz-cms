/*
  Warnings:

  - You are about to alter the column `price` on the `TravelPackage` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PackageImage_packageId_idx";

-- AlterTable
ALTER TABLE "TravelPackage" ADD COLUMN     "contactCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "numberOfDays" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";
