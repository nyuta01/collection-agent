import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Item } from '../index';
import { saveItems } from '../storage';
import type { CollectionType } from '../index';
import type { Json } from 'drizzle-zod';

describe('Item API', () => {
  const testCollectionId = 888;

  // Mock collection with JSON Schema
  const mockCollection: CollectionType = {
    id: testCollectionId,
    title: 'Test Collection',
    description: 'Test collection for items',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        value: { type: 'number' },
        active: { type: 'boolean' },
      },
      required: ['name', 'value'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const itemAPI = Item(mockCollection);

  beforeEach(async () => {
    // Clean up before each test
    await saveItems(testCollectionId, []);
  });

  afterEach(async () => {
    // Clean up after each test
    await saveItems(testCollectionId, []);
  });

  describe('add', () => {
    it('should add a valid item', async () => {
      const newItem: Json = {
        name: 'Test Item',
        value: 100,
        active: true,
      };

      const result = await itemAPI.add(newItem);

      expect(result).toBeDefined();
      expect((result as Record<string, Json>).id).toBeDefined();
      expect((result as Record<string, Json>).name).toBe('Test Item');
      expect((result as Record<string, Json>).value).toBe(100);
      expect((result as Record<string, Json>).active).toBe(true);
    });

    it('should generate ULID for new item', async () => {
      const newItem: Json = { name: 'Item 1', value: 50 };
      const result = await itemAPI.add(newItem);

      const id = (result as Record<string, Json>).id as string;
      expect(id).toBeDefined();
      expect(id.length).toBe(26); // ULID length
    });

    it('should reject item missing required fields', async () => {
      const invalidItem: Json = { name: 'Test' }; // missing 'value'

      await expect(itemAPI.add(invalidItem)).rejects.toThrow('Item validation failed');
    });

    it('should reject item with wrong type', async () => {
      const invalidItem: Json = {
        name: 'Test',
        value: 'not-a-number', // wrong type
      };

      await expect(itemAPI.add(invalidItem)).rejects.toThrow('Item validation failed');
    });

    it('should add multiple items', async () => {
      const item1: Json = { name: 'Item 1', value: 100 };
      const item2: Json = { name: 'Item 2', value: 200 };

      await itemAPI.add(item1);
      await itemAPI.add(item2);

      const allItems = await itemAPI.getAll();
      expect(allItems).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should get item by id', async () => {
      const newItem: Json = { name: 'Test Item', value: 100 };
      const added = await itemAPI.add(newItem);
      const id = (added as Record<string, Json>).id as string;

      const retrieved = await itemAPI.get(id);

      expect(retrieved).toEqual(added);
    });

    it('should throw error if item not found', async () => {
      await expect(itemAPI.get('non-existent-id')).rejects.toThrow('Item with id non-existent-id not found');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no items exist', async () => {
      const items = await itemAPI.getAll();
      expect(items).toEqual([]);
    });

    it('should return all items', async () => {
      await itemAPI.add({ name: 'Item 1', value: 100 });
      await itemAPI.add({ name: 'Item 2', value: 200 });
      await itemAPI.add({ name: 'Item 3', value: 300 });

      const allItems = await itemAPI.getAll();
      expect(allItems).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update existing item', async () => {
      const newItem: Json = { name: 'Original', value: 100 };
      const added = await itemAPI.add(newItem);
      const id = (added as Record<string, Json>).id as string;

      const updatedData: Json = { name: 'Updated', value: 200, active: true };
      const updated = await itemAPI.update(id, updatedData);

      expect((updated as Record<string, Json>).id).toBe(id);
      expect((updated as Record<string, Json>).name).toBe('Updated');
      expect((updated as Record<string, Json>).value).toBe(200);
      expect((updated as Record<string, Json>).active).toBe(true);
    });

    it('should validate updated item', async () => {
      const newItem: Json = { name: 'Original', value: 100 };
      const added = await itemAPI.add(newItem);
      const id = (added as Record<string, Json>).id as string;

      const invalidUpdate: Json = { name: 'Updated' }; // missing 'value'

      await expect(itemAPI.update(id, invalidUpdate)).rejects.toThrow('Item validation failed');
    });

    it('should throw error if item not found', async () => {
      const updateData: Json = { name: 'Updated', value: 200 };

      await expect(itemAPI.update('non-existent-id', updateData)).rejects.toThrow(
        'Item with id non-existent-id not found'
      );
    });

    it('should preserve item ID after update', async () => {
      const newItem: Json = { name: 'Original', value: 100 };
      const added = await itemAPI.add(newItem);
      const originalId = (added as Record<string, Json>).id as string;

      const updatedData: Json = { name: 'Updated', value: 200 };
      const updated = await itemAPI.update(originalId, updatedData);

      expect((updated as Record<string, Json>).id).toBe(originalId);
    });
  });

  describe('remove', () => {
    it('should delete existing item', async () => {
      const newItem: Json = { name: 'Test Item', value: 100 };
      const added = await itemAPI.add(newItem);
      const id = (added as Record<string, Json>).id as string;

      await itemAPI.remove(id);

      await expect(itemAPI.get(id)).rejects.toThrow('Item with id');
    });

    it('should throw error if item not found', async () => {
      await expect(itemAPI.remove('non-existent-id')).rejects.toThrow('Item with id non-existent-id not found');
    });

    it('should only delete specified item', async () => {
      const item1 = await itemAPI.add({ name: 'Item 1', value: 100 });
      const item2 = await itemAPI.add({ name: 'Item 2', value: 200 });
      const id1 = (item1 as Record<string, Json>).id as string;
      const id2 = (item2 as Record<string, Json>).id as string;

      await itemAPI.remove(id1);

      const allItems = await itemAPI.getAll();
      expect(allItems).toHaveLength(1);
      expect((allItems[0] as Record<string, Json>).id).toBe(id2);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Add test items
      await itemAPI.add({ name: 'Apple Product', value: 100 });
      await itemAPI.add({ name: 'Banana Product', value: 200 });
      await itemAPI.add({ name: 'Apple Juice', value: 50 });
      await itemAPI.add({ name: 'Orange Juice', value: 60 });
    });

    it('should search items by name', async () => {
      const results = await itemAPI.search('Apple');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((item) => ((item as Record<string, Json>).name as string).includes('Apple'))
      ).toBe(true);
    });

    it('should search items by value', async () => {
      const results = await itemAPI.search('200');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array when no matches found', async () => {
      const results = await itemAPI.search('NonExistentTerm');

      expect(results).toEqual([]);
    });

    it('should perform fuzzy search', async () => {
      const results = await itemAPI.search('Aple'); // typo in "Apple"

      // Fuse.js should still find "Apple" with fuzzy matching
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array when no items exist', async () => {
      await saveItems(testCollectionId, []);
      const results = await itemAPI.search('test');

      expect(results).toEqual([]);
    });
  });

  describe('integration', () => {
    it('should handle complete CRUD workflow', async () => {
      // Create
      const created = await itemAPI.add({ name: 'Workflow Item', value: 100 });
      const id = (created as Record<string, Json>).id as string;

      // Read
      const retrieved = await itemAPI.get(id);
      expect(retrieved).toEqual(created);

      // Update
      const updated = await itemAPI.update(id, { name: 'Updated Item', value: 150 });
      expect((updated as Record<string, Json>).name).toBe('Updated Item');

      // Search
      const searchResults = await itemAPI.search('Updated');
      expect(searchResults.length).toBeGreaterThan(0);

      // Delete
      await itemAPI.remove(id);
      await expect(itemAPI.get(id)).rejects.toThrow();
    });

    it('should maintain data consistency with multiple operations', async () => {
      const items = [
        { name: 'Item A', value: 10 },
        { name: 'Item B', value: 20 },
        { name: 'Item C', value: 30 },
      ];

      const addedItems = [];
      for (const item of items) {
        const added = await itemAPI.add(item);
        addedItems.push(added);
      }

      const allItems = await itemAPI.getAll();
      expect(allItems).toHaveLength(3);

      // Update one item
      const id = (addedItems[1] as Record<string, Json>).id as string;
      await itemAPI.update(id, { name: 'Item B Updated', value: 25 });

      // Delete one item
      await itemAPI.remove((addedItems[0] as Record<string, Json>).id as string);

      const finalItems = await itemAPI.getAll();
      expect(finalItems).toHaveLength(2);
    });
  });
});
