-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "bestseller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discountPrice" DECIMAL(10,2),
ADD COLUMN     "language" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "whatYouLearn" TEXT[] DEFAULT ARRAY[]::TEXT[];
