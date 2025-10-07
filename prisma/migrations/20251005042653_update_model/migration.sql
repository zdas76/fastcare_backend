-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_chemistId_idx` TO `orders_chemistId_fkey`;

-- RenameIndex
ALTER TABLE `orders` RENAME INDEX `orders_employeeId_idx` TO `orders_employeeId_fkey`;
