/*
  Warnings:

  - You are about to drop the `StakeholderDegree` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StakeholderDeisgnation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `stakeholder_degreeId_fkey`;

-- DropForeignKey
ALTER TABLE `stakeholder` DROP FOREIGN KEY `stakeholder_designationId_fkey`;

-- DropTable
DROP TABLE `StakeholderDegree`;

-- DropTable
DROP TABLE `StakeholderDeisgnation`;

-- CreateTable
CREATE TABLE `stakeholder_designation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `designation` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stakeholder_degree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `degreeName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stakeholder` ADD CONSTRAINT `stakeholder_degreeId_fkey` FOREIGN KEY (`degreeId`) REFERENCES `stakeholder_degree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholder` ADD CONSTRAINT `stakeholder_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `stakeholder_designation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
