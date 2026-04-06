-- Run this in Supabase SQL Editor: https://plhgbbgctofdgouikvbt.supabase.co/project/default/sql

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  synthesis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT,
  abstract TEXT,
  summary TEXT,
  analysis TEXT,
  user_notes TEXT DEFAULT '',
  url TEXT,
  tags JSONB DEFAULT '[]',
  query_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id SERIAL PRIMARY KEY,
  query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  query TEXT,
  interval_hours INTEGER,
  last_run TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  color TEXT DEFAULT '#7c5cfc',
  tags JSONB DEFAULT '[]',
  linked_paper_id INTEGER REFERENCES papers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - allow all for now
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development)
CREATE POLICY "Allow all" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON papers FOR ALL USING (true);
CREATE POLICY "Allow all" ON queries FOR ALL USING (true);
CREATE POLICY "Allow all" ON analyses FOR ALL USING (true);
CREATE POLICY "Allow all" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all" ON notes FOR ALL USING (true);
