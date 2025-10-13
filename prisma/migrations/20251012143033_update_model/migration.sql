/*
  Warnings:

  - You are about to drop the column `stakeholerId` on the `transaction_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction_info` DROP FOREIGN KEY `transaction_info_stakeholerId_fkey`;

-- DropIndex
DROP INDEX `transaction_info_stakeholerId_fkey` ON `transaction_info`;

-- AlterTable
ALTER TABLE `transaction_info` DROP COLUMN `stakeholerId`,
    ADD COLUMN `stakeholderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `transaction_info_stakeholerId_fkey` ON `transaction_info`(`stakeholderId`);

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `stakeholder`(`stakeId`) ON DELETE SET NULL ON UPDATE CASCADE;
