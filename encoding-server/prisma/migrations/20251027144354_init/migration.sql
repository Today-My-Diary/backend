-- CreateTable
CREATE TABLE `User` (
    `userId` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `videoId` BIGINT NOT NULL AUTO_INCREMENT,
    `s3Key` VARCHAR(191) NOT NULL,
    `s3Url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` BIGINT NOT NULL,

    UNIQUE INDEX `Video_s3Key_key`(`s3Key`),
    PRIMARY KEY (`videoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timestamp` (
    `timestampId` BIGINT NOT NULL AUTO_INCREMENT,
    `time` BIGINT NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `videoId` BIGINT NOT NULL,

    PRIMARY KEY (`timestampId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timestamp` ADD CONSTRAINT `Timestamp_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `Video`(`videoId`) ON DELETE RESTRICT ON UPDATE CASCADE;
