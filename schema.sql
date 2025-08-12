CREATE TABLE IF NOT EXISTS photo (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS description (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER NOT NULL REFERENCES photo(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
