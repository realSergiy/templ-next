import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export const createTestDatabase = () => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS lanes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
    
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      lane_id TEXT NOT NULL,
      start_quarter INTEGER NOT NULL,
      end_quarter INTEGER NOT NULL,
      status TEXT DEFAULT 'draft' NOT NULL,
      color TEXT,
      link_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (lane_id) REFERENCES lanes(id)
    );
    
    CREATE TABLE IF NOT EXISTS roadmap_metadata (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );
  `);

  return { db, sqlite };
};

export const seedTestDatabase = async (db: ReturnType<typeof drizzle>) => {
  const seedLanes = [
    { id: 'platform', name: 'Platform', order: 0 },
    { id: 'ux', name: 'UX', order: 1 },
    { id: 'growth', name: 'Growth', order: 2 },
  ];

  const seedFeatures = [
    {
      id: 'test-f1',
      title: 'Test Feature 1',
      laneId: 'platform',
      startQuarter: 20_251,
      endQuarter: 20_252,
      status: 'draft' as const,
      color: '#3B82F6',
    },
    {
      id: 'test-f2',
      title: 'Test Feature 2',
      laneId: 'ux',
      startQuarter: 20_251,
      endQuarter: 20_251,
      status: 'draft' as const,
      color: '#8B5CF6',
    },
    {
      id: 'test-f3',
      title: 'Test Feature 3',
      laneId: 'growth',
      startQuarter: 20_252,
      endQuarter: 20_253,
      status: 'draft' as const,
      color: '#10B981',
    },
  ];

  await db.delete(schema.features);
  await db.delete(schema.lanes);

  await db.insert(schema.lanes).values(seedLanes);
  await db.insert(schema.features).values(seedFeatures);

  return { lanes: seedLanes, features: seedFeatures };
};

export const cleanupTestDatabase = (sqlite: Database.Database) => {
  sqlite.close();
};
