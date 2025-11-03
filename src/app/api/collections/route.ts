import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Collection } from '@/lib/collection';

/**
 * GET /api/collections
 * Get all collections
 */
export async function GET() {
  try {
    const collections = await Collection.getAll();
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections
 * Create a new collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.schema) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, schema' },
        { status: 400 }
      );
    }

    const collection = await Collection.create({
      title: body.title,
      description: body.description,
      schema: body.schema,
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create collection' },
      { status: 500 }
    );
  }
}
