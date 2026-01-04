/*
  Warnings:

  - A unique constraint covering the columns `[deletionToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deletionToken" TEXT,
ADD COLUMN     "deletionTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_deletionToken_key" ON "public"."User"("deletionToken");
