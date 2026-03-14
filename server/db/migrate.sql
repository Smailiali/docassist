-- Run this once against your existing database to add Google OAuth support

-- Make password_hash nullable (Google OAuth users won't have one)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add Google OAuth columns to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index for fast google_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id);

-- Sessions table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
