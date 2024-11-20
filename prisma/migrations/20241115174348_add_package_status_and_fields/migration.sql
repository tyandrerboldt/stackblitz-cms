/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `TravelPackage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `TravelPackage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `TravelPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfDays` to the `TravelPackage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `TravelPackage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "TravelPackage" ADD COLUMN     "bathrooms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "dormitories" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfDays" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "PackageStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "suites" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "TravelPackage_code_key" ON "TravelPackage"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPackage_slug_key" ON "TravelPackage"("slug");
