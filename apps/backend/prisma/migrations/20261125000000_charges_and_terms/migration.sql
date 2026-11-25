-- AlterTable
ALTER TABLE "ProviderProfile" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
ADD COLUMN "termsVersion" TEXT;

-- AlterTable
ALTER TABLE "TopupTransaction" ADD COLUMN "receivedAmount" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "WalletCharge" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "commission" DECIMAL(65,30) NOT NULL,
    "activation" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletCharge_missionId_key" ON "WalletCharge"("missionId");
CREATE INDEX "WalletCharge_providerId_createdAt_idx" ON "WalletCharge"("providerId", "createdAt");
CREATE INDEX "WalletCharge_createdAt_idx" ON "WalletCharge"("createdAt");

-- AddForeignKey
ALTER TABLE "WalletCharge" ADD CONSTRAINT "WalletCharge_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Jobs completed before this table existed get their line. The 15 TND activation fee belongs to the job during
-- which it was charged (same moment as the completion).
INSERT INTO "WalletCharge" ("id", "providerId", "missionId", "commission", "activation", "createdAt")
SELECT gen_random_uuid()::text, m."providerId", m."id", m."commissionFee",
       CASE WHEN p."activationChargedAt" IS NOT NULL
                 AND ABS(EXTRACT(EPOCH FROM (p."activationChargedAt" - m."completedAt"))) < 60
            THEN 15 ELSE 0 END,
       COALESCE(m."completedAt", m."updatedAt")
FROM "Mission" m
JOIN "ProviderProfile" p ON p."id" = m."providerId"
WHERE m."status" = 'COMPLETED';
