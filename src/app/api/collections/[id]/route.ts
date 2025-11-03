import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Collection } from '@/lib/collection';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/collections/:id
 * Get a specific collection by ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collections/:id
 * Update a collection
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.schema) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, schema' },
        { status: 400 }
      );
    }

    const collection = await Collection.update(id, {
      title: body.title,
      description: body.description,
      schema: body.schema,
    });

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update collection' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await Collection.delete(id);

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
