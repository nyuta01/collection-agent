import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadItems, saveItems } from '../storage';
import type { StoredItem } from '../types';

describe('Storage Layer', () => {
  const testCollectionId = 999;
  const testItems: StoredItem[] = [
    { id: '01HQXYZ123ABC', name: 'Test Item 1', value: 100 },
    { id: '01HQXYZ456DEF', name: 'Test Item 2', value: 200 },
  ];

  afterEach(async () => {
    // Clean up: save empty array to remove test data
    try {
      await saveItems(testCollectionId, []);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('loadItems', () => {
    it('should return empty array when collection file does not exist', async () => {
      const items = await loadItems(testCollectionId);
      expect(items).toEqual([]);
    });

    it('should load items from MinIO', async () => {
      await saveItems(testCollectionId, testItems);
      const loadedItems = await loadItems(testCollectionId);

      expect(loadedItems).toHaveLength(2);
      expect(loadedItems).toEqual(testItems);
    });

    it('should handle empty array', async () => {
      await saveItems(testCollectionId, []);
      const loadedItems = await loadItems(testCollectionId);

      expect(loadedItems).toEqual([]);
    });
  });

  describe('saveItems', () => {
    it('should save items to MinIO', async () => {
      await saveItems(testCollectionId, testItems);
      const loadedItems = await loadItems(testCollectionId);

      expect(loadedItems).toEqual(testItems);
    });

    it('should overwrite existing items', async () => {
      await saveItems(testCollectionId, testItems);

      const newItems: StoredItem[] = [
        { id: '01HQXYZ789GHI', name: 'New Item', value: 300 },
      ];

      await saveItems(testCollectionId, newItems);
      const loadedItems = await loadItems(testCollectionId);

      expect(loadedItems).toHaveLength(1);
      expect(loadedItems).toEqual(newItems);
    });

    it('should save empty array', async () => {
      await saveItems(testCollectionId, testItems);
      await saveItems(testCollectionId, []);

      const loadedItems = await loadItems(testCollectionId);
      expect(loadedItems).toEqual([]);
    });
  });

  describe('integration', () => {
    it('should maintain data integrity through save/load cycles', async () => {
      const items1: StoredItem[] = [
        { id: '01HQXYZ001', name: 'Item A', value: 1 },
      ];

      await saveItems(testCollectionId, items1);
      let loaded = await loadItems(testCollectionId);
      expect(loaded).toEqual(items1);

      const items2: StoredItem[] = [
        ...items1,
        { id: '01HQXYZ002', name: 'Item B', value: 2 },
      ];

      await saveItems(testCollectionId, items2);
      loaded = await loadItems(testCollectionId);
      expect(loaded).toEqual(items2);
    });
  });
});
