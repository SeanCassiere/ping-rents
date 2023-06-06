/*
  Warnings:

  - A unique constraint covering the columns `[companyId,id]` on the table `Note` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Note_companyId_id_key` ON `Note`(`companyId`, `id`);
