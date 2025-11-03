import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Item Agent</h1>
        <p className="text-gray-600 mb-8">
          Manage your collections and items with JSON schema validation
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/agent"
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow bg-blue-50 border-blue-200"
          >
            <h2 className="text-2xl font-semibold mb-2">🤖 AI Agent</h2>
            <p className="text-gray-600">
              Chat with an AI assistant to manage your collections and items
            </p>
          </Link>

          <Link
            href="/collections"
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Collections</h2>
            <p className="text-gray-600">
              Create and manage collections with custom JSON schemas
            </p>
          </Link>

          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-2xl font-semibold mb-2">Features</h2>
            <ul className="text-gray-600 space-y-2">
              <li>• AI-powered assistant</li>
              <li>• JSON Schema validation</li>
              <li>• MinIO object storage</li>
              <li>• Full-text search</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <ol className="text-gray-700 space-y-1">
            <li>1. Create a new collection with a JSON schema</li>
            <li>2. Add items that conform to your schema</li>
            <li>3. Search and manage your items</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
