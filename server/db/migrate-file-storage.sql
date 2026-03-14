-- Migration: store uploaded PDFs as binary in the database instead of local filesystem.
-- NOTE: Neon free tier has 512MB storage limit. PDFs stored as BYTEA count against this.
-- For a portfolio/demo project this is acceptable — monitor usage if adding many large docs.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data BYTEA;
