/*
  Warnings:

  - You are about to drop the column `scopeId` on the `chemistes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `chemistes` DROP FOREIGN KEY `chemistes_scopeId_fkey`;

-- DropForeignKey
ALTER TABLE `depos` DROP FOREIGN KEY `depos_scopeId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `stakeholder_scopeId_fkey`;

-- DropIndex
DROP INDEX `chemistes_scopeId_fkey` ON `chemistes`;

-- AlterTable
ALTER TABLE `chemistes` DROP COLUMN `scopeId`;

-- AlterTable
ALTER TABLE `inventories` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transaction_info` MODIFY `voucherType` ENUM('SALES', 'PURCHASE', 'RECEIVED', 'PAYMENT', 'JOURNAL', 'CONTRA', 'TRANSFER', 'ALLOCATION', 'GIFT', 'MONEY_RECEIVED', 'OTHER', 'SALES_RETURN') NOT NULL;

-- CreateTable
CREATE TABLE `_ScopeChemists` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ScopeChemists_AB_unique`(`A`, `B`),
    INDEX `_ScopeChemists_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ScopeDepos` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ScopeDepos_AB_unique`(`A`, `B`),
    INDEX `_ScopeDepos_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ScopeStakeholders` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ScopeStakeholders_AB_unique`(`A`, `B`),
    INDEX `_ScopeStakeholders_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeChemists` ADD CONSTRAINT `_ScopeChemists_A_fkey` FOREIGN KEY (`A`) REFERENCES `chemistes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeChemists` ADD CONSTRAINT `_ScopeChemists_B_fkey` FOREIGN KEY (`B`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeDepos` ADD CONSTRAINT `_ScopeDepos_A_fkey` FOREIGN KEY (`A`) REFERENCES `depos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeDepos` ADD CONSTRAINT `_ScopeDepos_B_fkey` FOREIGN KEY (`B`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeStakeholders` ADD CONSTRAINT `_ScopeStakeholders_A_fkey` FOREIGN KEY (`A`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ScopeStakeholders` ADD CONSTRAINT `_ScopeStakeholders_B_fkey` FOREIGN KEY (`B`) REFERENCES `stakeholder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
