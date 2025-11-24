-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `photo` VARCHAR(191) NULL,
    `roles` JSON NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCK', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(100) NOT NULL,
    `motherName` VARCHAR(100) NOT NULL,
    `officeContactNo` VARCHAR(14) NULL,
    `currentAddress` VARCHAR(191) NULL,
    `permanentAddress` VARCHAR(100) NULL,
    `nid` VARCHAR(20) NULL,
    `dob` DATE NOT NULL,
    `contactNo` VARCHAR(14) NOT NULL,
    `emergencyContactNo` VARCHAR(14) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employee_profile_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depoId` INTEGER NOT NULL,
    `postName` VARCHAR(50) NOT NULL,
    `qualification` VARCHAR(250) NOT NULL,
    `responsibility` VARCHAR(500) NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `job_post_postName_key`(`postName`),
    INDEX `job_post_depoId_fkey`(`depoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chemistes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chemistId` VARCHAR(13) NOT NULL,
    `depoId` INTEGER NOT NULL,
    `scopeId` INTEGER NULL,
    `pharmacyName` VARCHAR(50) NOT NULL,
    `contactPerson` VARCHAR(50) NOT NULL,
    `contactNo` VARCHAR(50) NOT NULL,
    `address` VARCHAR(300) NOT NULL,
    `photo` VARCHAR(200) NULL,
    `discountRate` INTEGER NULL,
    `openingDueAmount` DOUBLE NULL DEFAULT 0,
    `openingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chemistes_chemistId_key`(`chemistId`),
    INDEX `chemistes_chemistId_idx`(`chemistId`),
    INDEX `chemistes_depoId_fkey`(`depoId`),
    INDEX `chemistes_scopeId_fkey`(`scopeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `depoName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `scopeId` INTEGER NULL,
    `status` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'ACTIVE', 'DELETED', 'PUSH', 'BLOCK', 'PENDING', 'CHECKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `depos_depoName_key`(`depoName`),
    INDEX `depos_scopeId_fkey`(`scopeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partyName` VARCHAR(191) NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `partytype` ENUM('SUPPLIER', 'VENDOR') NOT NULL,
    `openingAmount` DOUBLE NULL DEFAULT 0,
    `openingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stakeholder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `scopeId` INTEGER NULL,
    `stakeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `designationId` INTEGER NOT NULL,
    `degreeId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `officeAddress` VARCHAR(191) NOT NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `honorary` INTEGER NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `rxCommitment` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stakeholder_stakeId_key`(`stakeId`),
    INDEX `stakeholder_degreeId_fkey`(`degreeId`),
    INDEX `stakeholder_designationId_fkey`(`designationId`),
    INDEX `stakeholder_scopeId_fkey`(`scopeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StakeholderDeisgnation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `designation` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StakeholderDegree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `degreeName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stakeholderChember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stakeId` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `chemberDay` VARCHAR(191) NOT NULL,
    `chemberTime` VARCHAR(191) NOT NULL,
    `chemberName` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `stakeholderChember_stakeId_fkey`(`stakeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stakeholder_falily_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stakeId` VARCHAR(191) NOT NULL,
    `ocationName` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `personName` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `otherInfo` VARCHAR(191) NULL,

    INDEX `stakeholder_falily_info_stakeId_fkey`(`stakeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `contactNo` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scopeOfEmployee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `postId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `scopeOfEmployee_employeeId_key`(`employeeId`),
    INDEX `scopeOfEmployee_postId_fkey`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mop_target` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `tergatAmount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mop_target_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductWiseTarget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `targetStart` DATETIME(3) NOT NULL,
    `targetEnd` DATETIME(3) NOT NULL,
    `targetType` ENUM('MONTHLY', 'QUERTERLY', 'HALF_YEARLY', 'YEARLY') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductWiseTarget_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TargetProductBatch` (
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
CREATE TABLE `categoris` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryName` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categoris_categoryName_key`(`categoryName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_categoris` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subCategoryName` VARCHAR(150) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sub_categoris_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `units_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `account_heads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headName` VARCHAR(50) NOT NULL,
    `headCode` VARCHAR(2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_head` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ledgerName` VARCHAR(191) NOT NULL,
    `ledgerCode` VARCHAR(6) NOT NULL,
    `headCodeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ledger_head_headCodeId_fkey`(`headCodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(250) NOT NULL,
    `subCategoryId` INTEGER NOT NULL,
    `stakeholderId` INTEGER NULL,
    `size` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NOT NULL,
    `mrp` DOUBLE NOT NULL DEFAULT 0,
    `tp` DOUBLE NOT NULL DEFAULT 0,
    `balance` DOUBLE NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `date` DATETIME(3) NOT NULL,
    `status` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'ACTIVE', 'DELETED', 'PUSH', 'BLOCK', 'PENDING', 'CHECKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `products_subCategoryId_name_idx`(`subCategoryId`, `name`),
    INDEX `products_stakeholderId_fkey`(`stakeholderId`),
    INDEX `products_unitId_fkey`(`unitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bankName` VARCHAR(191) NOT NULL,
    `branceName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'ACTIVE', 'DELETED', 'PUSH', 'BLOCK', 'PENDING', 'CHECKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bank_accounts_bankName_accountNumber_key`(`bankName`, `accountNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `bankAccountId` INTEGER NOT NULL,
    `debitAmount` INTEGER NULL,
    `creditAmount` INTEGER NULL,
    `journalId` INTEGER NULL,
    `isClosing` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `bank_transactions_bankAccountId_idx`(`bankAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `productId` INTEGER NOT NULL,
    `depoId` INTEGER NULL,
    `transactionId` INTEGER NULL,
    `fixedJournalId` INTEGER NULL,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `quantityAdd` DOUBLE NULL DEFAULT 0,
    `quantityLess` DOUBLE NULL DEFAULT 0,
    `debitAmount` DOUBLE NULL,
    `creditAmount` DOUBLE NULL,
    `isClosing` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isFixted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `inventories_productId_idx`(`productId`),
    INDEX `inventories_depoId_fkey`(`depoId`),
    INDEX `inventories_transactionId_fkey`(`transactionId`),
    INDEX `inventories_fixedJournalId_fkey`(`fixedJournalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `voucherNo` VARCHAR(191) NOT NULL,
    `invoiceNo` VARCHAR(191) NULL,
    `chemistId` VARCHAR(191) NULL,
    `customerId` INTEGER NULL,
    `stakeholderId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `partyId` INTEGER NULL,
    `voucherType` ENUM('SALES', 'PURCHASE', 'RECEIVED', 'PAYMENT', 'JOURNAL', 'CONTRA', 'TRANSFER', 'ALLOCATION', 'GIFT', 'MONEY_RECEIVED', 'OTHER') NOT NULL,
    `paymentType` ENUM('PAID', 'DUE', 'PARTIAL') NULL,
    `status` ENUM('IN_STOCK', 'OUT_OF_STOCK', 'ACTIVE', 'DELETED', 'PUSH', 'BLOCK', 'PENDING', 'CHECKED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaction_info_voucherNo_key`(`voucherNo`),
    INDEX `transaction_info_chemistId_fkey`(`chemistId`),
    INDEX `transaction_info_customerId_fkey`(`customerId`),
    INDEX `transaction_info_stakeholerId_fkey`(`stakeholderId`),
    INDEX `transaction_info_partyId_fkey`(`partyId`),
    INDEX `transaction_info_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionId` INTEGER NULL,
    `ledgerHeadId` INTEGER NULL,
    `date` DATETIME(3) NOT NULL,
    `depoId` INTEGER NULL,
    `creditAmount` DOUBLE NULL,
    `debitAmount` DOUBLE NULL,
    `narration` VARCHAR(191) NULL,
    `isClosing` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `journals_depoId_fkey`(`depoId`),
    INDEX `journals_ledgerHeadId_fkey`(`ledgerHeadId`),
    INDEX `journals_transactionId_fkey`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fixed_journals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `voucherNo` VARCHAR(191) NOT NULL,
    `chemistId` VARCHAR(191) NOT NULL,
    `ledgerHeadId` INTEGER NOT NULL,
    `depoId` INTEGER NOT NULL,
    `creditAmount` DOUBLE NULL DEFAULT 0,
    `debitAmount` DOUBLE NULL DEFAULT 0,
    `narration` VARCHAR(191) NULL,
    `isClosing` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `transaction_info_chemistId_fkey`(`chemistId`),
    INDEX `journals_depoId_fkey`(`depoId`),
    INDEX `journals_ledgerHeadId_fkey`(`ledgerHeadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `chemistId` VARCHAR(191) NOT NULL,
    `orderNo` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `discount` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNo_key`(`orderNo`),
    INDEX `orders_chemistId_fkey`(`chemistId`),
    INDEX `orders_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quintity` INTEGER NOT NULL,
    `tpRate` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,

    INDEX `orderItems_orderId_fkey`(`orderId`),
    INDEX `orderItems_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'CONFIRMED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `comments` VARCHAR(191) NULL,
    `dateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `orderStatus_orderNo_fkey`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `comments` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `attendences_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `overtimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `overtimeDate` DATETIME(3) NOT NULL,
    `overtimeHours` VARCHAR(191) NOT NULL,
    `others` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `overtimes_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaveName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leves` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaveTypeId` INTEGER NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `leaveReason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `leves_employeeId_fkey`(`employeeId`),
    INDEX `leves_leaveTypeId_fkey`(`leaveTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employeeBankDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bankName` VARCHAR(191) NOT NULL,
    `bankAccountNumber` VARCHAR(191) NOT NULL,
    `branchName` VARCHAR(191) NOT NULL,
    `ifsscode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salaryInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `basicSalary` DOUBLE NOT NULL,
    `houseRend` DOUBLE NOT NULL,
    `mobile` DOUBLE NOT NULL,
    `medial` DOUBLE NOT NULL,
    `taDa` DOUBLE NOT NULL,
    `insuranceAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `salaryInfo_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payrolls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` VARCHAR(191) NOT NULL,
    `payDate` DATETIME(3) NOT NULL,
    `basicSalary` DOUBLE NOT NULL,
    `houseRend` DOUBLE NOT NULL,
    `mobile` DOUBLE NOT NULL,
    `medial` DOUBLE NOT NULL,
    `taDa` DOUBLE NOT NULL,
    `insentive` DOUBLE NOT NULL,
    `eidBonus` DOUBLE NOT NULL,
    `boishakhi` DOUBLE NOT NULL,
    `others` DOUBLE NOT NULL,
    `fp` DOUBLE NOT NULL,
    `insurance` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payrolls_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_profile` ADD CONSTRAINT `employee_profile_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_post` ADD CONSTRAINT `job_post_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistes` ADD CONSTRAINT `chemistes_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chemistes` ADD CONSTRAINT `chemistes_scopeId_fkey` FOREIGN KEY (`scopeId`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `depos` ADD CONSTRAINT `depos_scopeId_fkey` FOREIGN KEY (`scopeId`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholder` ADD CONSTRAINT `stakeholder_degreeId_fkey` FOREIGN KEY (`degreeId`) REFERENCES `StakeholderDegree`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholder` ADD CONSTRAINT `stakeholder_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `StakeholderDeisgnation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholder` ADD CONSTRAINT `stakeholder_scopeId_fkey` FOREIGN KEY (`scopeId`) REFERENCES `scopeOfEmployee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholderChember` ADD CONSTRAINT `stakeholderChember_stakeId_fkey` FOREIGN KEY (`stakeId`) REFERENCES `stakeholder`(`stakeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stakeholder_falily_info` ADD CONSTRAINT `stakeholder_falily_info_stakeId_fkey` FOREIGN KEY (`stakeId`) REFERENCES `stakeholder`(`stakeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scopeOfEmployee` ADD CONSTRAINT `scopeOfEmployee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scopeOfEmployee` ADD CONSTRAINT `scopeOfEmployee_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `job_post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mop_target` ADD CONSTRAINT `mop_target_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductWiseTarget` ADD CONSTRAINT `ProductWiseTarget_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TargetProductBatch` ADD CONSTRAINT `TargetProductBatch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TargetProductBatch` ADD CONSTRAINT `TargetProductBatch_productTargetId_fkey` FOREIGN KEY (`productTargetId`) REFERENCES `ProductWiseTarget`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_categoris` ADD CONSTRAINT `sub_categoris_categoryId_fk1` FOREIGN KEY (`categoryId`) REFERENCES `categoris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ledger_head` ADD CONSTRAINT `ledger_head_headCodeId_fkey` FOREIGN KEY (`headCodeId`) REFERENCES `account_heads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `stakeholder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categoris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_transactions` ADD CONSTRAINT `bank_transactions_bankAccountId_fkey` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_transactions` ADD CONSTRAINT `bank_transactions_journalId_fkey` FOREIGN KEY (`journalId`) REFERENCES `journals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_fixedJournalId_fkey` FOREIGN KEY (`fixedJournalId`) REFERENCES `fixed_journals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction_info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_chemistId_fkey` FOREIGN KEY (`chemistId`) REFERENCES `chemistes`(`chemistId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `parties`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_info` ADD CONSTRAINT `transaction_info_stakeholderId_fkey` FOREIGN KEY (`stakeholderId`) REFERENCES `stakeholder`(`stakeId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_ledgerHeadId_fkey` FOREIGN KEY (`ledgerHeadId`) REFERENCES `ledger_head`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journals` ADD CONSTRAINT `journals_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction_info`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_journals` ADD CONSTRAINT `fixed_journals_chemistId_fkey` FOREIGN KEY (`chemistId`) REFERENCES `chemistes`(`chemistId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_journals` ADD CONSTRAINT `fixed_journals_depoId_fkey` FOREIGN KEY (`depoId`) REFERENCES `depos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fixed_journals` ADD CONSTRAINT `fixed_journals_ledgerHeadId_fkey` FOREIGN KEY (`ledgerHeadId`) REFERENCES `ledger_head`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_chemistId_fkey` FOREIGN KEY (`chemistId`) REFERENCES `chemistes`(`chemistId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItems` ADD CONSTRAINT `orderItems_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderStatus` ADD CONSTRAINT `orderStatus_orderNo_fkey` FOREIGN KEY (`orderNo`) REFERENCES `orders`(`orderNo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendences` ADD CONSTRAINT `attendences_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `overtimes` ADD CONSTRAINT `overtimes_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leves` ADD CONSTRAINT `leves_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leves` ADD CONSTRAINT `leves_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `LeaveType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `salaryInfo` ADD CONSTRAINT `salaryInfo_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `user`(`employeeId`) ON DELETE RESTRICT ON UPDATE CASCADE;

