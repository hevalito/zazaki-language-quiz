-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "courseFinderData" JSONB;
ALTER TABLE "User" ALTER COLUMN "dailyGoal" SET DEFAULT 100;
