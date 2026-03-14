CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id);

CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),              -- legacy: kept for existing rows; null for new uploads
  file_data BYTEA,                     -- raw PDF binary (replaces filesystem storage)
  text_content TEXT NOT NULL,
  page_count INTEGER,
  summary JSONB,
  key_terms JSONB,
  deadlines JSONB,
  created_at TIMESTAMP DEFAULT NOW()
  -- NOTE: Neon free tier has 512MB storage limit. PDFs stored as BYTEA count against this.
  -- For a portfolio/demo project this is acceptable.
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
