-- 001_rewards_sla.sql — overdue rewards on the live database.
-- Run in the Supabase SQL Editor (idempotent: safe to run twice).
-- Adds the reporter contact + SLA / promo-code columns to complaints.
-- Existing tickets keep their SLA empty; the API backfills it from
-- created_at + 3 days the first time a reward is read.

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reporter_phone TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reporter_email TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reward_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS promo_code_created_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_complaints_sla ON complaints(sla_deadline);

-- Backfill the 3-day deadline for tickets created before this change.
UPDATE complaints
SET sla_deadline = created_at + INTERVAL '3 days'
WHERE sla_deadline IS NULL;
