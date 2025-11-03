'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Collection = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete collection');
      fetchCollections();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Collections</h1>
          <Link
            href="/collections/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Collection
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No collections yet. Create your first collection!
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link href={`/collections/${collection.id}`}>
                      <h2 className="text-xl font-semibold hover:text-blue-600 cursor-pointer">
                        {collection.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mt-2">{collection.description}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Created: {new Date(collection.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/collections/${collection.id}/edit`}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteCollection(collection.id)}
                      className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
