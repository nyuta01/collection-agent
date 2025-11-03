import { db } from "@/db";
import { collectionsTable, type collectionsInsertSchema, type collectionsSelectSchema } from "@/db/schema";
import type { z } from "zod";
import { eq, ilike } from "drizzle-orm";
import type { Json } from "drizzle-zod";
import type { AnySchemaObject } from "ajv";
import { ulid } from "ulid";
import Fuse from "fuse.js";
import { loadItems, saveItems } from "./storage";
import { validateItem } from "./validator";
import type { StoredItem } from "./types";

export type CollectionType = z.infer<typeof collectionsSelectSchema>;
export type CollectionInsertType = z.infer<typeof collectionsInsertSchema>;

export const Collection = {
  create: async (collection: CollectionInsertType): Promise<CollectionType> => {
    const _collection = await db.insert(collectionsTable).values(collection).returning();
    return _collection[0];
  },
  get: async (id: string): Promise<CollectionType> => {
    const _collection = await db.select().from(collectionsTable).where(eq(collectionsTable.id, id));
    return _collection[0];
  },
  getAll: async (): Promise<CollectionType[]> => {
    const _collections = await db.select().from(collectionsTable);
    return _collections;
  },
  update: async (id: string, collection: CollectionInsertType): Promise<CollectionType> => {
    const _collection = await db.update(collectionsTable).set(collection).where(eq(collectionsTable.id, id)).returning();
    return _collection[0];
  },
  delete: async (id: string): Promise<void> => {
    await db.delete(collectionsTable).where(eq(collectionsTable.id, id));
  },
  search: async (query: string): Promise<CollectionType[]> => {
    const collections = await db.select().from(collectionsTable).where(ilike(collectionsTable.title, `%${query}%`));
    return collections;
  },
};

export const Item = (collection: CollectionType) => {
  return {
    add: async (item: Json): Promise<Json> => {
      // Validate item against collection schema
      const validation = validateItem(item, collection.schema as AnySchemaObject);
      if (!validation.valid) {
        throw new Error(`Item validation failed: ${validation.errors?.join(", ")}`);
      }

      // Load existing items
      const items = (await loadItems(collection.id)) as StoredItem[];

      // Create new item with ULID
      const newItem: StoredItem = {
        id: ulid(),
        ...(item as Record<string, Json>),
      };

      // Add to items array and save
      items.push(newItem);
      await saveItems(collection.id, items);

      return newItem as Json;
    },

    get: async (id: string): Promise<Json> => {
      const items = (await loadItems(collection.id)) as StoredItem[];
      const item = items.find((i) => i.id === id);

      if (!item) {
        throw new Error(`Item with id ${id} not found`);
      }

      return item as Json;
    },

    getAll: async (): Promise<Json[]> => {
      const items = await loadItems(collection.id);
      return items as Json[];
    },

    update: async (id: string, item: Json): Promise<Json> => {
      // Validate item against collection schema
      const validation = validateItem(item, collection.schema as AnySchemaObject);
      if (!validation.valid) {
        throw new Error(`Item validation failed: ${validation.errors?.join(", ")}`);
      }

      // Load existing items
      const items = (await loadItems(collection.id)) as StoredItem[];
      const index = items.findIndex((i) => i.id === id);

      if (index === -1) {
        throw new Error(`Item with id ${id} not found`);
      }

      // Update item (preserve id)
      const updatedItem: StoredItem = {
        id,
        ...(item as Record<string, Json>),
      };

      items[index] = updatedItem;
      await saveItems(collection.id, items);

      return updatedItem as Json;
    },

    remove: async (id: string): Promise<void> => {
      const items = (await loadItems(collection.id)) as StoredItem[];
      const filteredItems = items.filter((i) => i.id !== id);

      if (filteredItems.length === items.length) {
        throw new Error(`Item with id ${id} not found`);
      }

      await saveItems(collection.id, filteredItems);
    },

    search: async (query: string): Promise<Json[]> => {
      const items = (await loadItems(collection.id)) as StoredItem[];

      if (items.length === 0) {
        return [];
      }

      // Use Fuse.js for fuzzy search across all fields
      const fuse = new Fuse(items, {
        keys: Object.keys(items[0] || {}),
        threshold: 0.4,
        includeScore: true,
      });

      const results = fuse.search(query);
      return results.map((result) => result.item as Json);
    },
  };
};
