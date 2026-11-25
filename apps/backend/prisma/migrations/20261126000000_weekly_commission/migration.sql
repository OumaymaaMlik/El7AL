-- When each charge must be paid. The first job (the one that carries the activation fee) is due at once; later jobs
-- are due at the end of their week: Monday 00:00 in Tunisia (UTC+1, no summer time), stored in UTC.
ALTER TABLE "WalletCharge" ADD COLUMN "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "WalletCharge"
SET "dueAt" = CASE
  WHEN "activation" > 0 THEN "createdAt"
  ELSE date_trunc('week', "createdAt" + INTERVAL '1 hour') + INTERVAL '7 days' - INTERVAL '1 hour'
END;
