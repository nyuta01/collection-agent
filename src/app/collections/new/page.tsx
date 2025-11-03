'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schema: JSON.stringify(
      {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name'],
      },
      null,
      2
    ),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate JSON schema
      const schema = JSON.parse(formData.schema);

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          schema,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create collection');
      }

      const collection = await res.json();
      router.push(`/collections/${collection.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create collection');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/collections" className="text-blue-600 hover:underline">
            ← Back to Collections
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Create New Collection</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Collection"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Description of your collection"
            />
          </div>

          <div>
            <label htmlFor="schema" className="block text-sm font-medium mb-2">
              JSON Schema
              <span className="text-gray-500 text-xs ml-2">(Defines the structure of items)</span>
            </label>
            <textarea
              required
              value={formData.schema}
              onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={15}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
            <Link
              href="/collections"
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
