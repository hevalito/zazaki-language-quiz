/*
  Warnings:

  - The values [A0] on the enum `Level` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Level_new" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
ALTER TABLE "public"."Course" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "currentLevel" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "currentLevel" TYPE "public"."Level_new" USING ("currentLevel"::text::"public"."Level_new");
ALTER TABLE "public"."Course" ALTER COLUMN "level" TYPE "public"."Level_new" USING ("level"::text::"public"."Level_new");
ALTER TYPE "public"."Level" RENAME TO "Level_old";
ALTER TYPE "public"."Level_new" RENAME TO "Level";
DROP TYPE "public"."Level_old";
ALTER TABLE "public"."Course" ALTER COLUMN "level" SET DEFAULT 'A1';
ALTER TABLE "public"."User" ALTER COLUMN "currentLevel" SET DEFAULT 'A1';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Course" ALTER COLUMN "level" SET DEFAULT 'A1';

-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "currentLevel" SET DEFAULT 'A1';
