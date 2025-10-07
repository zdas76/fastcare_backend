/*
  Warnings:

  - You are about to drop the column `orderStatusId` on the `transaction_info` table. All the data in the column will be lost.
  - You are about to alter the column `roles` on the `user` table. The data in that column could be lost. The data in that column will be cast from `LongText` to `Json`.

*/
-- DropForeignKey
ALTER TABLE `transaction_info` DROP FOREIGN KEY `transaction_info_orderStatusId_fkey`;

-- DropIndex
DROP INDEX `transaction_info_orderStatusId_fkey` ON `transaction_info`;

-- AlterTable
ALTER TABLE `journals` ALTER COLUMN `creditAmount` DROP DEFAULT,
    ALTER COLUMN `debitAmount` DROP DEFAULT;

-- AlterTable
ALTER TABLE `orders` MODIFY `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `transaction_info` DROP COLUMN `orderStatusId`;

-- AlterTable
ALTER TABLE `user` MODIFY `roles` JSON NOT NULL;
