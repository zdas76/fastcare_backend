-- AlterTable
ALTER TABLE `user` MODIFY `roles` LONGTEXT NOT NULL;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_chemistId_fkey` TO `orders_chemistId_idx`;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_userId_fkey` TO `orders_employeeId_idx`;
