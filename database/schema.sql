-- ============================================================================
-- CityPulse AI — PostgreSQL schema
-- CityFix Buildathon (Tutedude), Hyderabad civic intelligence platform.
-- Source: CityPulse AI Architecture Blueprint, section 5 (Database design).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- --- Enumerations -----------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('citizen', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'SUBMITTED', 'UNDER REVIEW', 'VERIFIED', 'IN PROGRESS', 'RESOLVED',
    'REJECTED', 'DUPLICATE_MERGED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_category AS ENUM (
    'Pothole', 'Garbage', 'Streetlight', 'Waterlogging',
    'Traffic Congestion', 'Footpath', 'Drainage', 'Other',
    'Traffic Police Challan', 'Wrong-Way Driving', 'Chemical Factory Pollution',
    'Political Complaint', 'Drainage Overflow', 'Rainwater Harvesting',
    'Water Conservation',
  'Road Damage', 'Traffic', 'Safety'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE complaint_severity AS ENUM ('Low', 'Medium', 'High');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --- users ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role         user_role NOT NULL DEFAULT 'citizen',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --- complaints -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no    TEXT NOT NULL UNIQUE,               -- e.g. CP-2026-0001
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category     complaint_category NOT NULL,
  description  TEXT NOT NULL,
  status       complaint_status NOT NULL DEFAULT 'SUBMITTED',
  severity     complaint_severity NOT NULL DEFAULT 'Medium',
  ward         TEXT NOT NULL,
  address      TEXT,
  is_demo      BOOLEAN NOT NULL DEFAULT FALSE,     -- demo data is labelled
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_ticket_no ON complaints(ticket_no);
CREATE INDEX IF NOT EXISTS idx_complaints_status    ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category  ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_ward      ON complaints(ward);
CREATE INDEX IF NOT EXISTS idx_complaints_user      ON complaints(user_id);

-- --- complaint_media --------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,                      -- Supabase Storage object key
  mime_type    TEXT NOT NULL,
  file_size    INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_complaint ON complaint_media(complaint_id);

-- --- locations --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  latitude     DOUBLE PRECISION NOT NULL CHECK (latitude  BETWEEN -90 AND 90),
  longitude    DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  address      TEXT
);
CREATE INDEX IF NOT EXISTS idx_locations_geo ON locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_complaint ON locations(complaint_id);

-- --- ai_analysis ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_analysis (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id       UUID REFERENCES complaints(id) ON DELETE CASCADE,
  model              TEXT NOT NULL,
  predicted_category complaint_category NOT NULL,
  confidence         DOUBLE PRECISION NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  suggested_severity complaint_severity,
  visible_evidence   TEXT,
  needs_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  human_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  human_correction   complaint_category,
  analysed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_complaint ON ai_analysis(complaint_id);

-- --- duplicate_matches ------------------------------------------------------
CREATE TABLE IF NOT EXISTS duplicate_matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  matched_id   UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  distance_m   DOUBLE PRECISION NOT NULL,
  similarity   DOUBLE PRECISION NOT NULL CHECK (similarity BETWEEN 0 AND 1),
  decision     TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending','duplicate','separate')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dup_complaint ON duplicate_matches(complaint_id);

-- --- status_history (append-only audit trail) -------------------------------
CREATE TABLE IF NOT EXISTS status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  old_status  complaint_status,
  new_status  complaint_status NOT NULL,
  updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  remarks     TEXT,
  reason      TEXT,                                -- required for REJECTED / DUPLICATE_MERGED
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON status_history(complaint_id, created_at);

-- --- issue_comments ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS issue_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_complaint ON issue_comments(complaint_id, created_at);

-- --- citizen_points ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizen_points (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points     INTEGER NOT NULL DEFAULT 0,
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_points_user ON citizen_points(user_id);

-- --- notifications ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
