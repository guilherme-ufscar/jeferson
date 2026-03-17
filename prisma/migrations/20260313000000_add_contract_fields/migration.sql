-- AlterTable: Add new fields to contracts
ALTER TABLE "contracts"
  ADD COLUMN IF NOT EXISTS "weeklyValue"       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "valorCaucao"       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "valorMultaAtraso"  DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "kmEntrega"         INTEGER,
  ADD COLUMN IF NOT EXISTS "porcentagemMensal" DECIMAL(5,2),
  ALTER COLUMN "monthlyValue" DROP NOT NULL;
