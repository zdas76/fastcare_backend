/*
  Warnings:

  - You are about to drop the column `fixedJournalId` on the `inventories` table. All the data in the column will be lost.
  - You are about to drop the column `isFixted` on the `inventories` table. All the data in the column will be lost.
  - You are about to drop the column `tergatAmount` on the `mop_target` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `transaction_info` table. All the data in the column will be lost.
  - You are about to drop the `ProductWiseTarget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TargetProductBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fixed_journals` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `targetAmount` to the `mop_target` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductWiseTarget` DROP FOREIGN KEY `ProductWiseTarget_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `TargetProductBatch` DROP FOREIGN KEY `TargetProductBatch_productId_fkey`;

-- DropForeignKey
ALTER TABLE `TargetProductBatch` DROP FOREIGN KEY `TargetProductBatch_productTargetId_fkey`;

-- DropForeignKey
ALTER TABLE `fixed_journals` DROP FOREIGN KEY `fixed_journals_chemistId_fkey`;

-- DropForeignKey
ALTER TABLE `fixed_journals` DROP FOREIGN KEY `fixed_journals_depoId_fkey`;

-- DropForeignKey
ALTER TABLE `fixed_journals` DROP FOREIGN KEY `fixed_journals_ledgerHeadId_fkey`;

-- DropForeignKey
ALTER TABLE `inventories` DROP FOREIGN KEY `inventories_fixedJournalId_fkey`;

-- DropForeignKey
ALTER TABLE `mop_target` DROP FOREIGN KEY `mop_target_employeeId_fkey`;

-- DropIndex
DROP INDEX `inventories_fixedJournalId_fkey` ON `inventories`;

-- DropIndex
DROP INDEX `mop_target_employeeId_key` ON `mop_target`;

-- AlterTable
ALTER TABLE `inventories` DROP COLUMN `fixedJournalId`,
    DROP COLUMN `isFixted`;

-- AlterTable
ALTER TABLE `mop_target` DROP COLUMN `tergatAmount`,
    ADD COLUMN `targetAmount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orderStatus` MODIFY `status` ENUM('PENDING', 'REVIEWING', 'CONFIRMED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'RECEIVED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `transaction_info` DROP COLUMN `paymentType`,
    MODIFY `voucherType` ENUM('SALES', 'PURCHASE', 'RECEIVED', 'PAYMENT', 'JOURNAL', 'CONTRA', 'TRANSFER', 'ALLOCATION', 'GIFT', 'MONEY_RECEIVED', 'OTHER', 'SALES_RETURN', 'WHOLESALE') NOT NULL;

-- DropTable
DROP TABLE `ProductWiseTarget`;

-- DropTable
DROP TABLE `TargetProductBatch`;

-- DropTable
DROP TABLE `fixed_journals`;

-- CreateTable
CREATE TABLE `product_wise_target` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `targetStart` DATETIME(3) NOT NULL,
    `targetEnd` DATETIME(3) NOT NULL,
    `targetType` ENUM('MONTHLY', 'QUERTERLY', 'HALF_YEARLY', 'YEARLY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_wise_target_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `target_product_batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `productTargetId` INTEGER NOT NULL,
    `numberOfProduct` INTEGER NOT NULL,
    `insentiveAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TargetProductBatch_productId_fkey`(`productId`),
    INDEX `TargetProductBatch_productTargetId_fkey`(`productTargetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depo_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `providerdepoId` INTEGER NOT NULL,
    `receverdepoId` INTEGER NOT NULL,
    `voucherNo` VARCHAR(191) NOT NULL,
    `voucherType` ENUM('SALES', 'PURCHASE', 'RECEIVED', 'PAYMENT', 'JOURNAL', 'CONTRA', 'TRANSFER', 'ALLOCATION', 'GIFT', 'MONEY_RECEIVED', 'OTHER', 'SALES_RETURN', 'WHOLESALE') NOT NULL DEFAULT 'ALLOCATION',
    `status` ENUM('PENDING', 'REVIEWING', 'CONFIRMED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'RECEIVED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `depo_transactions_providerdepoId_idx`(`providerdepoId`),
    INDEX `depo_transactions_receverdepoId_idx`(`receverdepoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depo_journal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depoTransactionId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `ledgerHeadId` INTEGER NOT NULL,
    `creditAmount` DOUBLE NULL DEFAULT 0,
    `debitAmount` DOUBLE NULL DEFAULT 0,
    `narration` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `depo_journal_ledgerHeadId_idx`(`ledgerHeadId`),
    INDEX `depo_journal_depoTransactionId_idx`(`depoTransactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depoinventories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depoTransactionId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `productId` INTEGER NOT NULL,
    `reqQuantity` INTEGER NULL DEFAULT 0,
    `acceptedQuantity` INTEGER NULL DEFAULT 0,
    `unitePrice` DOUBLE NULL DEFAULT 0,
    `amount` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `depoinventories_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_wise_target` ADD CONSTRAINT `product_wise_target_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `target_product_batch` ADD CONSTRAINT `target_product_batch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `target_product_batch` ADD CONSTRAINT `target_product_batch_productTargetId_fkey` FOREIGN KEY (`productTargetId`) REFERENCES `product_wise_target`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depo_transactions` ADD CONSTRAINT `depo_transactions_providerdepoId_fkey` FOREIGN KEY (`providerdepoId`) REFERENCES `depos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depo_transactions` ADD CONSTRAINT `depo_transactions_receverdepoId_fkey` FOREIGN KEY (`receverdepoId`) REFERENCES `depos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depo_journal` ADD CONSTRAINT `depo_journal_depoTransactionId_fkey` FOREIGN KEY (`depoTransactionId`) REFERENCES `depo_transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depo_journal` ADD CONSTRAINT `depo_journal_ledgerHeadId_fkey` FOREIGN KEY (`ledgerHeadId`) REFERENCES `ledger_head`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depoinventories` ADD CONSTRAINT `depoinventories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depoinventories` ADD CONSTRAINT `depoinventories_depoTransactionId_fkey` FOREIGN KEY (`depoTransactionId`) REFERENCES `depo_transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `inventories` RENAME INDEX `inventories_depoId_fkey` TO `inventories_depoId_idx`;

-- RenameIndex
ALTER TABLE `inventories` RENAME INDEX `inventories_transactionId_fkey` TO `inventories_transactionId_idx`;

-- RenameIndex
ALTER TABLE `journals` RENAME INDEX `journals_depoId_fkey` TO `journals_depoId_idx`;

-- RenameIndex
ALTER TABLE `journals` RENAME INDEX `journals_ledgerHeadId_fkey` TO `journals_ledgerHeadId_idx`;

-- RenameIndex
ALTER TABLE `journals` RENAME INDEX `journals_transactionId_fkey` TO `journals_transactionId_idx`;

-- RenameIndex
ALTER TABLE `transaction_info` RENAME INDEX `transaction_info_chemistId_fkey` TO `transaction_info_chemistId_idx`;

-- RenameIndex
ALTER TABLE `transaction_info` RENAME INDEX `transaction_info_customerId_fkey` TO `transaction_info_customerId_idx`;

-- RenameIndex
ALTER TABLE `transaction_info` RENAME INDEX `transaction_info_employeeId_fkey` TO `transaction_info_employeeId_idx`;

-- RenameIndex
ALTER TABLE `transaction_info` RENAME INDEX `transaction_info_partyId_fkey` TO `transaction_info_partyId_idx`;

-- RenameIndex
ALTER TABLE `transaction_info` RENAME INDEX `transaction_info_stakeholerId_fkey` TO `transaction_info_stakeholderId_idx`;
