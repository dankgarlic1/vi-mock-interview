/*
  Warnings:

  - You are about to drop the column `careerAspirations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currentEducationLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `filledApplication` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `grades` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredCountries` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredPrograms` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `previousDegree` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `visaQuestions` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Eligibility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Program` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "careerAspirations",
DROP COLUMN "currentEducationLevel",
DROP COLUMN "filledApplication",
DROP COLUMN "grades",
DROP COLUMN "preferredCountries",
DROP COLUMN "preferredPrograms",
DROP COLUMN "previousDegree",
DROP COLUMN "visaQuestions",
ADD COLUMN     "careerGoals" TEXT,
ADD COLUMN     "currentRole" TEXT,
ADD COLUMN     "filledProfile" BOOLEAN DEFAULT false,
ADD COLUMN     "interviewPreferences" TEXT,
ADD COLUMN     "preferredCompanies" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "targetRole" TEXT,
ADD COLUMN     "yearsOfExperience" INTEGER;

-- DropTable
DROP TABLE "Eligibility";

-- DropTable
DROP TABLE "Program";

-- CreateTable
CREATE TABLE "InterviewResource" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "difficulty" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewResource_pkey" PRIMARY KEY ("id")
);
