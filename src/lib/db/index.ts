import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const isTestEnvironment = process.env.NODE_ENV === 'test';
const dbPath = isTestEnvironment ? ':memory:' : './roadmap.db';
const sqlite = new Database(dbPath);

// Initialize database schema for test environment
if (isTestEnvironment) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS lanes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      lane_id TEXT NOT NULL,
      start_quarter INTEGER NOT NULL,
      end_quarter INTEGER NOT NULL,
      status TEXT DEFAULT 'draft' NOT NULL,
      link_url TEXT,
      color TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (lane_id) REFERENCES lanes(id) ON UPDATE no action ON DELETE no action
    );
    
    CREATE TABLE IF NOT EXISTS published_roadmap (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      published_at INTEGER DEFAULT (unixepoch()) NOT NULL
    );
  `);
}

export const db = drizzle(sqlite, { schema });

export * from './schema';
