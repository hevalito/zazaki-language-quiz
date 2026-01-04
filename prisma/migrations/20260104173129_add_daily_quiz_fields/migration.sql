/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."QuizType" AS ENUM ('STANDARD', 'DAILY');

-- AlterTable
ALTER TABLE "public"."Question" ALTER COLUMN "quizId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "type" "public"."QuizType" NOT NULL DEFAULT 'STANDARD',
ALTER COLUMN "lessonId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_date_key" ON "public"."Quiz"("date");
