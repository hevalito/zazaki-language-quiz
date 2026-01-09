-- CreateEnum
CREATE TYPE "public"."ActivityStatus" AS ENUM ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ActivityType" ADD VALUE 'QUIZ_STARTED';
ALTER TYPE "public"."ActivityType" ADD VALUE 'LEARNING_SESSION_STARTED';

-- AlterTable
ALTER TABLE "public"."Activity" ADD COLUMN     "status" "public"."ActivityStatus" NOT NULL DEFAULT 'COMPLETED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
