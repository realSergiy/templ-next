import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const lanes = sqliteTable('lanes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const features = sqliteTable('features', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  laneId: text('lane_id')
    .notNull()
    .references(() => lanes.id),
  startQuarter: integer('start_quarter').notNull(),
  endQuarter: integer('end_quarter').notNull(),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  linkUrl: text('link_url'),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const publishedRoadmap = sqliteTable('published_roadmap', {
  id: text('id').primaryKey(),
  data: text('data').notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Lane = typeof lanes.$inferSelect;
export type NewLane = typeof lanes.$inferInsert;
export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
export type PublishedRoadmap = typeof publishedRoadmap.$inferSelect;
