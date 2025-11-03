import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Collection, Item } from '@/lib/collection';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/collections/:id/items
 * Get all items in a collection
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const itemAPI = Item(collection);
    const items = await itemAPI.getAll();

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collections/:id/items
 * Create a new item in a collection
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const body = await request.json();
    const itemAPI = Item(collection);

    try {
      const newItem = await itemAPI.add(body);
      return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
      // Validation error
      if (error instanceof Error && error.message.includes('validation failed')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create item' },
      { status: 500 }
    );
  }
}
