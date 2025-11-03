import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Collection, Item } from '@/lib/collection';

type Params = {
  params: Promise<{
    id: string;
    itemId: string;
  }>;
};

/**
 * GET /api/collections/:id/items/:itemId
 * Get a specific item by ID
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id, itemId } = await params;
    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const itemAPI = Item(collection);

    try {
      const item = await itemAPI.get(itemId);
      return NextResponse.json(item);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collections/:id/items/:itemId
 * Update an item
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id, itemId } = await params;
    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const body = await request.json();
    const itemAPI = Item(collection);

    try {
      const updatedItem = await itemAPI.update(itemId, body);
      return NextResponse.json(updatedItem);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (error.message.includes('validation failed')) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/:id/items/:itemId
 * Delete an item
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id, itemId } = await params;
    const collection = await Collection.get(id);

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const itemAPI = Item(collection);

    try {
      await itemAPI.remove(itemId);
      return NextResponse.json({ message: 'Item deleted successfully' });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete item' },
      { status: 500 }
    );
  }
}
