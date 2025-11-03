'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import ItemForm, { type JSONSchema } from '@/components/ItemForm';

type Collection = {
  id: string;
  title: string;
  description: string;
  schema: JSONSchema;
  createdAt: string;
};

type Item = {
  id: string;
  [key: string]: unknown;
};

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[] | null>(null);

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (!res.ok) throw new Error('Failed to fetch collection');
      const data = await res.json();
      setCollection(data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${id}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
    fetchItems();
  }, [fetchCollection, fetchItems]);

  const handleAddItem = async (data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/collections/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add item');
      }

      setShowAddItem(false);
      fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add item');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/collections/${id}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');
      fetchItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const res = await fetch(`/api/collections/${id}/items/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to search');
      const data = await res.json();
      setSearchResults(data.results);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to search');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!collection) return <div className="p-8">Collection not found</div>;

  const displayItems = searchResults !== null ? searchResults : items;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/collections" className="text-blue-600 hover:underline">
            ← Back to Collections
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{collection.title}</h1>
          <p className="text-gray-600 mt-2">{collection.description}</p>
          <p className="text-sm text-gray-400 mt-2">
            Created: {new Date(collection.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search items..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Search
              </button>
              {searchResults !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddItem(!showAddItem)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showAddItem ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {showAddItem && collection && (
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Add New Item</h3>
            <ItemForm
              schema={collection.schema}
              onSubmit={handleAddItem}
              onCancel={() => setShowAddItem(false)}
            />
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          {searchResults !== null ? `Found ${searchResults.length} result(s)` : `${items.length} item(s)`}
        </div>

        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchResults !== null ? 'No items found' : 'No items yet. Add your first item!'}
          </div>
        ) : (
          <div className="grid gap-4">
            {displayItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id as string)}
                    className="ml-4 px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
