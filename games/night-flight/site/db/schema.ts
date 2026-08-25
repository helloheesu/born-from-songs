import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const orbitMessages = sqliteTable(
  'orbit_messages',
  {
    id: text('id').primaryKey(),
    message: text('message').notNull(),
    paletteJson: text('palette_json').notNull(),
    status: text('status').notNull().default('visible'),
    sampleKey: integer('sample_key').notNull(),
    clientHash: text('client_hash').notNull(),
    createdAt: integer('created_at').notNull(),
    reportCount: integer('report_count').notNull().default(0),
  },
  (table) => [
    index('idx_orbit_messages_visible_sample').on(table.status, table.sampleKey),
    index('idx_orbit_messages_client_created').on(table.clientHash, table.createdAt),
  ],
);
