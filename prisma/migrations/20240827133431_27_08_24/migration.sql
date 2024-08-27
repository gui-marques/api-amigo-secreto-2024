/*
  Warnings:

  - Added the required column `chave` to the `EventPeople` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventPeople" ADD COLUMN     "chave" TEXT NOT NULL;
