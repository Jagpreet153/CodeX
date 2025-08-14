/*
  Warnings:

  - You are about to drop the column `expires` on the `Usage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usage" DROP COLUMN "expires",
ADD COLUMN     "expire" TIMESTAMP(3);
