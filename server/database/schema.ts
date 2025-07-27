import { relations, sql } from 'drizzle-orm'
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const pages = sqliteTable('pages', {
    // Core Fields from SdxPage
    uuid: text('uuid').primaryKey().$defaultFn(() => crypto.randomUUID()), // Page unique identifier
    name: text('name').notNull().default('Untitled Page'),
    icon: text('icon').notNull().default('lucide:file'), // Default icon if needed
    content: text('content').notNull().default(''), // Store Markdown/HTML/JSON here

    // Relational/Structural Fields
    parentPageId: text('parentPageId').references(() => pages.uuid, { onDelete: 'cascade' }),

    // Storing complex data as JSON strings in SQLite
    persistentData: text('persistent_data'), // Store JSON stringified object
    reference_to: text('reference_to'),     // Store JSON stringified array of referenced page UUIDs

    // Timestamps (managed by application or triggers if needed)
    createdAt: integer('created_at', { mode: 'timestamp_ms' }) // Store as milliseconds since epoch
        .$defaultFn(() => new Date()), // Set default on creation using Drizzle
    modifiedAt: integer('modified_at', { mode: 'timestamp_ms' }) // Store as milliseconds since epoch
        .$defaultFn(() => new Date()),
});

export const pagesRelations = relations(pages, ({ one, many }) => ({
    children: many(pages),
    parent: one(pages, {
        fields: [pages.parentPageId],
        references: [pages.id]
    })
}))