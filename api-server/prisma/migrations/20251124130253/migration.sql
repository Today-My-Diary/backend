/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Video` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[thumbnailS3Key]` on the table `Video` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,uploadDate]` on the table `Video` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploadDate` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Video` DROP COLUMN `createdAt`,
    ADD COLUMN `status` ENUM('PENDING', 'COMPLETE') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `thumbnailS3Key` VARCHAR(191) NULL,
    ADD COLUMN `thumbnailS3Url` VARCHAR(191) NULL,
    ADD COLUMN `uploadDate` VARCHAR(191) NOT NULL,
    MODIFY `s3Key` VARCHAR(191) NULL,
    MODIFY `s3Url` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Video_thumbnailS3Key_key` ON `Video`(`thumbnailS3Key`);

-- CreateIndex
CREATE UNIQUE INDEX `Video_userId_uploadDate_key` ON `Video`(`userId`, `uploadDate`);
