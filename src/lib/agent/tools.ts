import { z } from 'zod';
import { Collection, Item, type CollectionType } from '@/lib/collection';

/**
 * Agent tools for managing collections and items
 */

export const tools = {
  listCollections: {
    description: 'List all collections. Returns an array of collections with their id, title, description, schema, and timestamps.',
    inputSchema: z.object({}),
    execute: async () => {
      const collections = await Collection.getAll();
      return {
        success: true,
        collections,
        count: collections.length,
      };
    },
  },

  getCollection: {
    description: 'Get a specific collection by ID. Returns the collection details including id, title, description, schema, and timestamps.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection to retrieve'),
    }),
    execute: async ({ collectionId }: { collectionId: string }): Promise<{ success: boolean; collection?: CollectionType; error?: string }> => {
      try {
        const collection = await Collection.get(collectionId);
        return {
          success: true,
          collection,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get collection',
        };
      }
    },
  },

  createCollection: {
    description: 'Create a new collection with a title, description, and JSON schema. The schema defines the structure that items in this collection must follow.',
    inputSchema: z.object({
      title: z.string().describe('The title of the collection'),
      description: z.string().describe('A description of what this collection is for'),
      schema: z.record(z.string(), z.unknown()).describe('JSON Schema object that defines the structure of items. Must include "type": "object" and "properties" with field definitions.'),
    }),
    execute: async ({ title, description, schema }: { title: string; description: string; schema: Record<string, unknown> }) => {
      try {
        const collection = await Collection.create({
          title,
          description,
          schema,
        });
        return {
          success: true,
          collection,
          message: `Collection "${title}" created successfully with ID: ${collection.id}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create collection',
        };
      }
    },
  },

  updateCollection: {
    description: 'Update an existing collection\'s title, description, or schema. Warning: Changing the schema may affect existing items.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection to update'),
      title: z.string().describe('The new title for the collection'),
      description: z.string().describe('The new description for the collection'),
      schema: z.record(z.string(), z.unknown()).describe('The new JSON Schema for the collection'),
    }),
    execute: async ({ collectionId, title, description, schema }: { collectionId: string; title: string; description: string; schema: Record<string, unknown> }) => {
      try {
        const collection = await Collection.update(collectionId, {
          title,
          description,
          schema,
        });
        return {
          success: true,
          collection,
          message: `Collection "${title}" updated successfully`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update collection',
        };
      }
    },
  },

  deleteCollection: {
    description: 'Delete a collection and all its items. This action cannot be undone.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection to delete'),
    }),
    execute: async ({ collectionId }: { collectionId: string }) => {
      try {
        await Collection.delete(collectionId);
        return {
          success: true,
          message: 'Collection deleted successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete collection',
        };
      }
    },
  },

  searchCollections: {
    description: 'Search for collections by title. Returns an array of collections with their id, title, description, schema, and timestamps.',
    inputSchema: z.object({
      query: z.string().describe('The search query string'),
    }),
    execute: async ({ query }: { query: string }) => {
      const collections = await Collection.search(query);
      return {
        success: true,
        collections,
        count: collections.length,
      };
    },
  },

  listItems: {
    description: 'List all items in a collection. Returns an array of items with their data.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
    }),
    execute: async ({ collectionId }: { collectionId: string }) => {
      try {
        const collection = await Collection.get(collectionId);
        const items = await Item(collection).getAll();
        return {
          success: true,
          items,
          count: items.length,
          collectionTitle: collection.title,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list items',
        };
      }
    },
  },

  getItem: {
    description: 'Get a specific item from a collection by its ID.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
      itemId: z.string().describe('The ULID of the item to retrieve'),
    }),
    execute: async ({ collectionId, itemId }: { collectionId: string; itemId: string }) => {
      try {
        const collection = await Collection.get(collectionId);
        const item = await Item(collection).get(itemId);
        return {
          success: true,
          item,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get item',
        };
      }
    },
  },

  addItem: {
    description: 'Add a new item to a collection. The item must conform to the collection\'s JSON schema.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
      data: z.record(z.string(), z.unknown()).describe('The item data as a JSON object that conforms to the collection schema'),
    }),
    execute: async ({ collectionId, data }: { collectionId: string; data: Record<string, unknown> }) => {
      try {
        const collection = await Collection.get(collectionId);
        const item = await Item(collection).add(data);
        return {
          success: true,
          item,
          message: 'Item added successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add item',
        };
      }
    },
  },

  updateItem: {
    description: 'Update an existing item in a collection. The updated data must conform to the collection\'s JSON schema.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
      itemId: z.string().describe('The ULID of the item to update'),
      data: z.record(z.string(), z.unknown()).describe('The updated item data as a JSON object'),
    }),
    execute: async ({ collectionId, itemId, data }: { collectionId: string; itemId: string; data: Record<string, unknown> }) => {
      try {
        const collection = await Collection.get(collectionId);
        const item = await Item(collection).update(itemId, data);
        return {
          success: true,
          item,
          message: 'Item updated successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update item',
        };
      }
    },
  },

  deleteItem: {
    description: 'Delete an item from a collection. This action cannot be undone.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
      itemId: z.string().describe('The ULID of the item to delete'),
    }),
    execute: async ({ collectionId, itemId }: { collectionId: string; itemId: string }) => {
      try {
        const collection = await Collection.get(collectionId);
        await Item(collection).remove(itemId);
        return {
          success: true,
          message: 'Item deleted successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete item',
        };
      }
    },
  },

  searchItems: {
    description: 'Search for items in a collection using fuzzy search. Searches across all fields in the items.',
    inputSchema: z.object({
      collectionId: z.string().describe('The UUID of the collection'),
      query: z.string().describe('The search query string'),
    }),
    execute: async ({ collectionId, query }: { collectionId: string; query: string }) => {
      try {
        const collection = await Collection.get(collectionId);
        const results = await Item(collection).search(query);
        return {
          success: true,
          results,
          count: results.length,
          query,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to search items',
        };
      }
    },
  },
};
