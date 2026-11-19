-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN "activationChargedAt" TIMESTAMP(3);

-- Artisans who were already verified before the activation fee existed do not pay it.
UPDATE "ProviderProfile" SET "activationChargedAt" = COALESCE("verifiedAt", NOW()) WHERE "verifiedAt" IS NOT NULL;
