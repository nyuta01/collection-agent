'use client';

import { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Collection = {
  id: string;
  title: string;
  description: string;
  schema: unknown;
};

export default function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schema: '',
  });

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (!res.ok) throw new Error('Failed to fetch collection');
      const data: Collection = await res.json();

      setFormData({
        title: data.title,
        description: data.description,
        schema: JSON.stringify(data.schema, null, 2),
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load collection');
      router.push('/collections');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate JSON schema
      const schema = JSON.parse(formData.schema);

      const res = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          schema,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update collection');
      }

      router.push(`/collections/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update collection');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href={`/collections/${id}`} className="text-blue-600 hover:underline">
            ← Back to Collection
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Edit Collection</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Collection"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
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
              id="schema"
              required
              value={formData.schema}
              onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={15}
            />
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ Warning: Changing the schema may affect existing items
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/collections/${id}`}
              className="px-6 py-2 border rounded hover:bg-gray-100 inline-block text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
