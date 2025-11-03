import { jsonb, pgTable, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { createSchemaFactory, type Json } from "drizzle-zod";

const { createSelectSchema, createInsertSchema, createUpdateSchema } =
	createSchemaFactory({
		coerce: {
			date: true,
		},
	});

export const collectionsTable = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  schema: jsonb().$type<Json>().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const collectionsSelectSchema = createSelectSchema(collectionsTable);
export const collectionsInsertSchema = createInsertSchema(collectionsTable);
export const collectionsUpdateSchema = createUpdateSchema(collectionsTable);

