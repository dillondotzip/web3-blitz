/*
  Warnings:

  - A unique constraint covering the columns `[hashedToken,type]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `Token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `nftsOwned` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `balance` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('RESET_PASSWORD');

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nftsOwned" JSONB NOT NULL,
ALTER COLUMN "balance" SET NOT NULL,
ALTER COLUMN "balance" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Token_hashedToken_type_key" ON "Token"("hashedToken", "type");
