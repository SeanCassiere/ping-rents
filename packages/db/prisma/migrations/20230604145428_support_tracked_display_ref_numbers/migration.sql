-- AlterTable
ALTER TABLE `Company` ADD COLUMN `nextAgreementTrackNumber` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `nextPaymentTrackNumber` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `nextReservationTrackNumber` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `Rental` ADD COLUMN `displayRefNo` VARCHAR(255) NOT NULL DEFAULT '1';
