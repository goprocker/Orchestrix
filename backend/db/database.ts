import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL for external connections
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        synthesis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS papers (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        title TEXT,
        abstract TEXT,
        summary TEXT,
        analysis TEXT,
        user_notes TEXT DEFAULT '',
        url TEXT,
        tags TEXT DEFAULT '[]',
        query_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS queries (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        query_id INTEGER REFERENCES queries(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        query TEXT,
        interval_hours INTEGER,
        last_run TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        title TEXT,
        content TEXT,
        color TEXT DEFAULT '#7c5cfc',
        tags TEXT DEFAULT '[]',
        linked_paper_id INTEGER REFERENCES papers(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("PostgreSQL Database initialized successfully.");
  } finally {
    client.release();
  }
}

export default pool;
